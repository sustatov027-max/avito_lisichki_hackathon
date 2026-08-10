package postgres

import (
	"github.com/jackc/pgx/v5/pgxpool"
)

type ChainRepository struct {
	db *pgxpool.Pool
}

func NewChainRepository(db *pgxpool.Pool) *ChainRepository {
	return &ChainRepository{db: db}
}
