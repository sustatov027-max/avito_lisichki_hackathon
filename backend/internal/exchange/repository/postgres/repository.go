package postgres

import (
	"github.com/jackc/pgx/v5/pgxpool"
)

type TradeOfferRepository struct {
	db *pgxpool.Pool
}

func NewTradeOfferRepository(db *pgxpool.Pool) *TradeOfferRepository {
	return &TradeOfferRepository{
		db: db,
	}
}
