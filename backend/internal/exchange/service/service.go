package service

import (
	"context"

	"github.com/google/uuid"
	"github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/exchange"
	repoDTO "github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/exchange/repository"
)

type TradeOfferRepository interface {
	CreateOffer(ctx context.Context, params repoDTO.CreateOfferParams, idempotency repoDTO.IdempotencyParams) (*repoDTO.CreateOfferResult, error)
	GetByUserID(ctx context.Context, userID uuid.UUID) ([]exchange.Item, error)
}

type ExchangeService struct {
	repo TradeOfferRepository
}

func NewExchangeService(repo TradeOfferRepository) *ExchangeService {
	return &ExchangeService{
		repo: repo,
	}
}
