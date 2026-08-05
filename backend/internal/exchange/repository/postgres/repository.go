package postgres

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	repoDTO "github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/exchange/repository"
)

type TradeOfferRepository struct {
	db *pgxpool.Pool
}

func NewTradeOfferRepository(db *pgxpool.Pool) *TradeOfferRepository {
	return &TradeOfferRepository{
		db: db,
	}
}

func (r *TradeOfferRepository) CreateOffer(
	ctx context.Context,
	params repoDTO.CreateOfferParams,
	idempotency repoDTO.IdempotencyParams,
) (*repoDTO.CreateOfferResult, error) {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("begin transaction: %w", err)
	}
	defer func() {
		_ = tx.Rollback(ctx)
	}()

	// 1. Проверка идемпотентности
	if idempotency.Key != "" {
		result, err := r.checkIdempotency(ctx, tx, params.UserID, idempotency)
		if err != nil {
			return nil, err
		}
		if result != nil {
			return result, nil // Повторный запрос, отдаем закешированный результат
		}
	}

	// 2. Вставка предложенного товара
	offeredItemID, status, createdAt, err := r.insertOfferedItem(ctx, tx, params)
	if err != nil {
		return nil, fmt.Errorf("insert offered_item: %w", err)
	}

	// 3. Вставка желаемого товара
	desiredItemID, err := r.insertDesiredItem(ctx, tx, offeredItemID, params)
	if err != nil {
		return nil, fmt.Errorf("insert desired_item: %w", err)
	}

	// 3.5. Ищем и создаем цепочки обмена
	rows, err := tx.Query(ctx,
		`SELECT find_and_create_exchange_chains($1)`,
		offeredItemID,
	)
	if err != nil {
		return nil, fmt.Errorf("find exchange chains: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var chainID uuid.UUID
		if err := rows.Scan(&chainID); err != nil {
			return nil, fmt.Errorf("scan chain id: %w", err)
		}
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate chains: %w", err)
	}

	result := &repoDTO.CreateOfferResult{
		OfferedItemID: offeredItemID,
		DesiredItemID: desiredItemID,
		Status:        status,
		CreatedAt:     createdAt,
		Replayed:      false,
	}

	// 4. Фиксация ключа идемпотентности
	if idempotency.Key != "" {
		if err := r.saveIdempotency(ctx, tx, params.UserID, idempotency, result); err != nil {
			return nil, fmt.Errorf("save idempotency key: %w", err)
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("commit transaction: %w", err)
	}

	return result, nil
}

// --- Helper Functions ---

func (r *TradeOfferRepository) checkIdempotency(
	ctx context.Context,
	tx pgx.Tx,
	userID uuid.UUID,
	idempotency repoDTO.IdempotencyParams,
) (*repoDTO.CreateOfferResult, error) {
	if _, err := tx.Exec(ctx, `
		SELECT pg_advisory_xact_lock(hashtextextended($1::text || ':' || $2, 0))
	`, userID, idempotency.Key); err != nil {
		return nil, fmt.Errorf("lock idempotency key: %w", err)
	}

	var res repoDTO.CreateOfferResult
	var existingHash string

	err := tx.QueryRow(ctx, `
		SELECT request_hash, offered_item_id, desired_item_id, status, created_at
		FROM idempotency_keys
		WHERE user_id = $1 AND key = $2
		FOR UPDATE
	`, userID, idempotency.Key).Scan(
		&existingHash,
		&res.OfferedItemID,
		&res.DesiredItemID,
		&res.Status,
		&res.CreatedAt,
	)

	if err == nil {
		if existingHash != idempotency.RequestHash {
			return nil, repoDTO.ErrIdempotencyConflict
		}
		res.Replayed = true
		return &res, nil
	}

	if !errors.Is(err, pgx.ErrNoRows) {
		return nil, fmt.Errorf("check idempotency key: %w", err)
	}

	return nil, nil
}

func (r *TradeOfferRepository) insertOfferedItem(
	ctx context.Context,
	tx pgx.Tx,
	params repoDTO.CreateOfferParams,
) (uuid.UUID, string, time.Time, error) {
	var (
		id        uuid.UUID
		status    string
		createdAt time.Time
	)

	query := `
		INSERT INTO offered_items (
			user_id, city_name, delivery_enabled, title, description, 
			category_id, estimated_price, photos, attributes, status
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		RETURNING id, status, created_at`

	err := tx.QueryRow(ctx, query,
		params.UserID, params.CityName, params.DeliveryEnabled,
		params.OfferedItem.Title, params.OfferedItem.Description,
		params.OfferedItem.CategoryID, params.OfferedItem.EstimatedPrice,
		params.OfferedItem.Photos, params.OfferedItem.Attributes,
		params.OfferedItem.Status,
	).Scan(&id, &status, &createdAt)

	return id, status, createdAt, err
}

func (r *TradeOfferRepository) insertDesiredItem(
	ctx context.Context,
	tx pgx.Tx,
	offeredItemID uuid.UUID,
	params repoDTO.CreateOfferParams,
) (uuid.UUID, error) {
	var desiredItemID uuid.UUID

	query := `
		INSERT INTO desired_items (
			offered_item_id, title_pattern, category_id, 
			min_price, max_price, allow_delivery, attributes
		) VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id`

	err := tx.QueryRow(ctx, query,
		offeredItemID, params.DesiredItem.TitlePattern,
		params.DesiredItem.CategoryID, params.DesiredItem.MinPrice,
		params.DesiredItem.MaxPrice, params.DesiredItem.AllowDelivery,
		params.DesiredItem.Attributes,
	).Scan(&desiredItemID)

	return desiredItemID, err
}

func (r *TradeOfferRepository) saveIdempotency(
	ctx context.Context,
	tx pgx.Tx,
	userID uuid.UUID,
	idempotency repoDTO.IdempotencyParams,
	res *repoDTO.CreateOfferResult,
) error {
	query := `
		INSERT INTO idempotency_keys (
			user_id, key, request_hash, offered_item_id, desired_item_id, status, created_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7)`

	_, err := tx.Exec(ctx, query,
		userID, idempotency.Key, idempotency.RequestHash,
		res.OfferedItemID, res.DesiredItemID, res.Status, res.CreatedAt,
	)
	return err
}