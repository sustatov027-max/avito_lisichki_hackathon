package postgres

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	repoDTO "github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/chain/repository"
)

func (r *ChainRepository) ProcessDecision(
	ctx context.Context,
	params repoDTO.ProcessDecisionParams,
) (*repoDTO.ProcessDecisionResult, error) {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("begin transaction: %w", err)
	}
	defer func() {
		_ = tx.Rollback(ctx)
	}()

	// 1. Блокировка цепочки через advisory lock
	if err := r.lockChain(ctx, tx, params.ChainID); err != nil {
		return nil, fmt.Errorf("lock chain: %w", err)
	}

	// 2. Проверка текущего статуса цепочки
	if err := r.verifyChainProposed(ctx, tx, params.ChainID); err != nil {
		return nil, err
	}

	// 3. Получение шага пользователя и проверка отсутствия решения
	stepID, err := r.getUserStepID(ctx, tx, params.ChainID, params.UserID)
	if err != nil {
		return nil, err
	}

	// 4. Обработка решения (Reject / Accept)
	var finalStatus string
	switch params.Action {
	case "reject":
		finalStatus, err = r.processReject(ctx, tx, params.ChainID, stepID)
	case "accept":
		finalStatus, err = r.processAccept(ctx, tx, params.ChainID, stepID)
	default:
		return nil, repoDTO.ErrInvalidAction
	}

	if err != nil {
		return nil, err
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("commit transaction: %w", err)
	}

	return &repoDTO.ProcessDecisionResult{
		ChainID: params.ChainID,
		Status:  finalStatus,
	}, nil
}

func (r *ChainRepository) lockChain(ctx context.Context, tx pgx.Tx, chainID uuid.UUID) error {
	_, err := tx.Exec(ctx, `
		SELECT pg_advisory_xact_lock(hashtextextended($1::text, 0))
	`, chainID)
	return err
}

func (r *ChainRepository) verifyChainProposed(ctx context.Context, tx pgx.Tx, chainID uuid.UUID) error {
	var (
		status    string
		expiresAt time.Time
	)
	err := tx.QueryRow(ctx, `
		SELECT status, expires_at 
		FROM exchange_chains 
		WHERE id = $1 FOR UPDATE
	`, chainID).Scan(&status, &expiresAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return repoDTO.ErrChainNotFound
		}
		return fmt.Errorf("fetch chain status: %w", err)
	}

	if status != "proposed" {
		return repoDTO.ErrChainNotProposed
	}

	if !expiresAt.After(time.Now()) {
		// Ленивая инвалидация: раз уже увидели просроченную цепочку — сразу
		// переводим её в expired, чтобы не оставлять "проросшую" proposed-запись.
		if _, updErr := tx.Exec(ctx, `
			UPDATE exchange_chains 
			SET status = 'expired', updated_at = CURRENT_TIMESTAMP 
			WHERE id = $1
		`, chainID); updErr != nil {
			return fmt.Errorf("mark chain expired: %w", updErr)
		}
		return repoDTO.ErrChainExpired
	}

	return nil
}

func (r *ChainRepository) getUserStepID(ctx context.Context, tx pgx.Tx, chainID, userID uuid.UUID) (uuid.UUID, error) {
	var stepID uuid.UUID

	err := tx.QueryRow(ctx, `
		SELECT id
		FROM exchange_chain_steps 
		WHERE chain_id = $1 AND from_user_id = $2 FOR UPDATE
	`, chainID, userID).Scan(&stepID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return uuid.Nil, repoDTO.ErrStepNotFound
		}
		return uuid.Nil, fmt.Errorf("fetch chain step: %w", err)
	}

	return stepID, nil
}

func (r *ChainRepository) processReject(ctx context.Context, tx pgx.Tx, chainID, stepID uuid.UUID) (string, error) {
	_, err := tx.Exec(ctx, `
		UPDATE exchange_chain_steps 
		SET is_accepted = FALSE 
		WHERE id = $1
	`, stepID)
	if err != nil {
		return "", fmt.Errorf("update step to rejected: %w", err)
	}

	_, err = tx.Exec(ctx, `
		UPDATE exchange_chains 
		SET status = 'rejected', updated_at = CURRENT_TIMESTAMP 
		WHERE id = $1
	`, chainID)
	if err != nil {
		return "", fmt.Errorf("update chain status to rejected: %w", err)
	}

	return "rejected", nil
}

func (r *ChainRepository) processAccept(ctx context.Context, tx pgx.Tx, chainID, stepID uuid.UUID) (string, error) {
	_, err := tx.Exec(ctx, `
		UPDATE exchange_chain_steps 
		SET is_accepted = TRUE 
		WHERE id = $1
	`, stepID)
	if err != nil {
		return "", fmt.Errorf("update step to accepted: %w", err)
	}

	var unacceptedCount int
	err = tx.QueryRow(ctx, `
		SELECT COUNT(*) 
		FROM exchange_chain_steps 
		WHERE chain_id = $1 AND (is_accepted IS NULL OR is_accepted = FALSE)
	`, chainID).Scan(&unacceptedCount)
	if err != nil {
		return "", fmt.Errorf("count unaccepted steps: %w", err)
	}

	if unacceptedCount > 0 {
		return "proposed", nil
	}

	if err := r.finalizeAcceptedChain(ctx, tx, chainID); err != nil {
		return "", err
	}

	return "accepted", nil
}

func (r *ChainRepository) finalizeAcceptedChain(ctx context.Context, tx pgx.Tx, chainID uuid.UUID) error {
	var expectedReservedItemCount int
	if err := tx.QueryRow(ctx, `
		SELECT COUNT(*)
		FROM exchange_chain_steps
		WHERE chain_id = $1
	`, chainID).Scan(&expectedReservedItemCount); err != nil {
		return fmt.Errorf("count chain steps: %w", err)
	}

	rows, err := tx.Query(ctx, `
		UPDATE offered_items 
		SET status = 'reserved', updated_at = CURRENT_TIMESTAMP 
		WHERE id IN (
			SELECT offered_item_id FROM exchange_chain_steps WHERE chain_id = $1
		)
		AND status = 'active'
		RETURNING id
	`, chainID)
	if err != nil {
		return fmt.Errorf("reserve offered items: %w", err)
	}
	defer rows.Close()

	var reservedItemIDs []uuid.UUID
	for rows.Next() {
		var itemID uuid.UUID
		if err := rows.Scan(&itemID); err != nil {
			return fmt.Errorf("scan reserved item id: %w", err)
		}
		reservedItemIDs = append(reservedItemIDs, itemID)
	}

	if err := rows.Err(); err != nil {
		return fmt.Errorf("rows iterate reserved items: %w", err)
	}

	if len(reservedItemIDs) != expectedReservedItemCount {
		return repoDTO.ErrItemsAlreadyReserved
	}

	_, err = tx.Exec(ctx, `
		UPDATE exchange_chains 
		SET status = 'accepted', updated_at = CURRENT_TIMESTAMP 
		WHERE id = $1
	`, chainID)
	if err != nil {
		return fmt.Errorf("update chain status to accepted: %w", err)
	}

	_, err = tx.Exec(ctx, `
		UPDATE exchange_chains 
		SET status = 'invalidated', updated_at = CURRENT_TIMESTAMP 
		WHERE id IN (
			SELECT DISTINCT chain_id 
			FROM exchange_chain_steps 
			WHERE offered_item_id = ANY($1) AND chain_id != $2
		) AND status = 'proposed'
	`, reservedItemIDs, chainID)
	if err != nil {
		return fmt.Errorf("invalidate overlapping chains: %w", err)
	}

	return nil
}
