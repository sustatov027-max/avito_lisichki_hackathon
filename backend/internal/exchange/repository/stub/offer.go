package stub

import (
	"context"
	"sync"
	"time"

	"github.com/google/uuid"
	repoDTO "github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/exchange/repository"
)

type TradeOfferStubRepository struct {
	mu     sync.RWMutex
	offers map[uuid.UUID]repoDTO.CreateOfferParams
}

func NewTradeOfferStubRepository() *TradeOfferStubRepository {
	return &TradeOfferStubRepository{
		offers: make(map[uuid.UUID]repoDTO.CreateOfferParams),
	}
}

func (r *TradeOfferStubRepository) CreateOffer(ctx context.Context, params repoDTO.CreateOfferParams) (*repoDTO.CreateOfferResult, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	offeredItemID := uuid.New()
	desiredItemID := uuid.New()

	// Сохраняем в память для проверки
	r.offers[offeredItemID] = params

	return &repoDTO.CreateOfferResult{
		OfferedItemID: offeredItemID,
		DesiredItemID: desiredItemID,
		Status:        "active",
		CreatedAt:     time.Now(),
	}, nil
}