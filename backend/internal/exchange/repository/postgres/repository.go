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
		if _, err := tx.Exec(ctx, `
			SELECT pg_advisory_xact_lock(hashtextextended($1::text || ':' || $2, 0))
		`, params.UserID, idempotency.Key); err != nil {
			return nil, fmt.Errorf("lock idempotency key: %w", err)
		}
		
		var (
			existingHash          string
			existingOfferedItemID uuid.UUID
			existingDesiredItemID uuid.UUID
			existingStatus        string
			existingCreatedAt     time.Time
		)

		err := tx.QueryRow(ctx, `
			SELECT request_hash, offered_item_id, desired_item_id, status, created_at
			FROM idempotency_keys
			WHERE user_id = $1 AND key = $2
			FOR UPDATE
		`, params.UserID, idempotency.Key).Scan(
			&existingHash,
			&existingOfferedItemID,
			&existingDesiredItemID,
			&existingStatus,
			&existingCreatedAt,
		)

		if err == nil {
			// Ключ уже существовал в системе
			if existingHash != idempotency.RequestHash {
				return nil, repoDTO.ErrIdempotencyConflict
			}

			return &repoDTO.CreateOfferResult{
				OfferedItemID: existingOfferedItemID,
				DesiredItemID: existingDesiredItemID,
				Status:        existingStatus,
				CreatedAt:     existingCreatedAt,
				Replayed:      true,
			}, nil
		} else if !errors.Is(err, pgx.ErrNoRows) {
			return nil, fmt.Errorf("check idempotency key: %w", err)
		}
	}

	// 2. Вставка предложенного товара (offered_item)
	var (
		offeredItemID uuid.UUID
		status        string
		createdAt     time.Time
	)

	err = tx.QueryRow(ctx, `
		INSERT INTO offered_items (
			user_id,
			city_name,
			delivery_enabled,
			title,
			description,
			category_id,
			estimated_price,
			photos,
			attributes,
			status
		)
		VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10
		)
		RETURNING id, status, created_at
	`,
		params.UserID,
		params.CityName,
		params.DeliveryEnabled,
		params.OfferedItem.Title,
		params.OfferedItem.Description,
		params.OfferedItem.CategoryID,
		params.OfferedItem.EstimatedPrice,
		params.OfferedItem.Photos,
		params.OfferedItem.Attributes,
		params.OfferedItem.Status,
	).Scan(
		&offeredItemID,
		&status,
		&createdAt,
	)

	if err != nil {
		return nil, fmt.Errorf("insert offered_item: %w", err)
	}

	// 3. Вставка желаемого товара (desired_item)
	var desiredItemID uuid.UUID

	err = tx.QueryRow(ctx, `
		INSERT INTO desired_items (
			offered_item_id,
			title_pattern,
			category_id,
			min_price,
			max_price,
			allow_delivery,
			attributes
		)
		VALUES (
			$1, $2, $3, $4, $5, $6, $7
		)
		RETURNING id
	`,
		offeredItemID,
		params.DesiredItem.TitlePattern,
		params.DesiredItem.CategoryID,
		params.DesiredItem.MinPrice,
		params.DesiredItem.MaxPrice,
		params.DesiredItem.AllowDelivery,
		params.DesiredItem.Attributes,
	).Scan(&desiredItemID)

	if err != nil {
		return nil, fmt.Errorf("insert desired_item: %w", err)
	}

	// 4. Фиксация ключа идемпотентности при наличии
	if idempotency.Key != "" {
		_, err = tx.Exec(ctx, `
			INSERT INTO idempotency_keys (
				user_id, key, request_hash, offered_item_id, desired_item_id, status, created_at
			) VALUES ($1, $2, $3, $4, $5, $6, $7)
		`,
			params.UserID,
			idempotency.Key,
			idempotency.RequestHash,
			offeredItemID,
			desiredItemID,
			status,
			createdAt,
		)
		if err != nil {
			return nil, fmt.Errorf("save idempotency key: %w", err)
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("commit transaction: %w", err)
	}

	return &repoDTO.CreateOfferResult{
		OfferedItemID: offeredItemID,
		DesiredItemID: desiredItemID,
		Status:        status,
		CreatedAt:     createdAt,
		Replayed:      false,
	}, nil
}