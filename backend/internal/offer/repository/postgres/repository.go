package postgres

import "github.com/jackc/pgx/v5/pgxpool"

type OfferRepository struct {
	db *pgxpool.Pool
}

func NewOfferRepository(db *pgxpool.Pool) *OfferRepository {
	return &OfferRepository{db: db}
}
