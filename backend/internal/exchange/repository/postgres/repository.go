package postgres

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
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
) (*repoDTO.CreateOfferResult, error) {

	tx, err := r.db.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("begin transaction: %w", err)
	}
	defer func() {
		_ = tx.Rollback(ctx)
	}()

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
			$1,$2,$3,$4,$5,$6,$7,$8,$9,$10
		)
		RETURNING id,status,created_at
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
			$1,$2,$3,$4,$5,$6,$7
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

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("commit transaction: %w", err)
	}

	return &repoDTO.CreateOfferResult{
		OfferedItemID: offeredItemID,
		DesiredItemID: desiredItemID,
		Status:        status,
		CreatedAt:     createdAt,
	}, nil
}
