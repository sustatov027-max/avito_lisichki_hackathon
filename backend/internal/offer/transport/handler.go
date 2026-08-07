package transport

import (
	"context"

	"github.com/google/uuid"
	"github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/offer/dto"
)

type OfferService interface {
	GetMyOffers(ctx context.Context, userID uuid.UUID) (*dto.GetMyOffersResponse, error)
}

type OfferHandler struct {
	service OfferService
}

func NewOfferHandler(service OfferService) *OfferHandler {
	return &OfferHandler{service: service}
}
