package transport

import (
	"context"

	"github.com/google/uuid"
	"github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/exchange/dto"
)

const idempotencyKeyHeader = "Idempotency-Key"

type ExchangeService interface {
	PostExchange(ctx context.Context, userID uuid.UUID, idempotencyKey string, req dto.PostExchangeRequest) (*dto.PostExchangeResponse, error)
	GetMyOffers(ctx context.Context, userID uuid.UUID) (*dto.GetMyOffersResponse, error)
}

type ExchangeHandler struct {
	service ExchangeService
}

func NewExchangeHandler(service ExchangeService) *ExchangeHandler {
	return &ExchangeHandler{
		service: service,
	}
}
