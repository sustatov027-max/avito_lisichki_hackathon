package service

import (
	"context"

	"github.com/google/uuid"
	"github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/offer"
)

type OfferRepository interface {
	GetByUserID(ctx context.Context, userID uuid.UUID) ([]offer.Item, error)
}

type OfferService struct {
	repository OfferRepository
}

func NewOfferService(repository OfferRepository) *OfferService {
	return &OfferService{repository: repository}
}
