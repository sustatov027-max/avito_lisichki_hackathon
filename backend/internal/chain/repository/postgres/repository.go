package postgres

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	chains "github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/chain"
)

type ChainRepository struct {
	db *pgxpool.Pool
}

func NewChainRepository(db *pgxpool.Pool) *ChainRepository {
	return &ChainRepository{db: db}
}

func (r *ChainRepository) GetByID(ctx context.Context, chainID uuid.UUID) (*chains.Chain, error) {
	var chain chains.Chain
	err := r.db.QueryRow(ctx, `
		SELECT id, status, chain_length, created_at, updated_at
		FROM exchange_chains
		WHERE id = $1
	`, chainID).Scan(
		&chain.ID,
		&chain.Status,
		&chain.ChainLength,
		&chain.CreatedAt,
		&chain.UpdatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, chains.ErrNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("query exchange chain: %w", err)
	}

	rows, err := r.db.Query(ctx, `
		SELECT id, step_order, from_user_id, to_user_id,
		       offered_item_id, received_item_id, is_accepted
		FROM exchange_chain_steps
		WHERE chain_id = $1
		ORDER BY step_order
	`, chainID)
	if err != nil {
		return nil, fmt.Errorf("query exchange chain steps: %w", err)
	}
	defer rows.Close()

	chain.Steps = make([]chains.Step, 0, chain.ChainLength)
	for rows.Next() {
		var step chains.Step
		if err := rows.Scan(
			&step.ID,
			&step.Order,
			&step.FromUserID,
			&step.ToUserID,
			&step.OfferedItemID,
			&step.ReceivedItemID,
			&step.IsAccepted,
		); err != nil {
			return nil, fmt.Errorf("scan exchange chain step: %w", err)
		}
		chain.Steps = append(chain.Steps, step)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate exchange chain steps: %w", err)
	}

	return &chain, nil
}
