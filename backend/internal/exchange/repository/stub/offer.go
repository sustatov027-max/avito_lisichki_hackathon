package stub

import (
	"context"
	"sync"
	"time"

	"github.com/google/uuid"
	repoDTO "github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/exchange/repository"
)

type TradeOfferStubRepository struct {
	mu              sync.RWMutex
	offers          map[uuid.UUID]repoDTO.CreateOfferParams
	idempotencyKeys map[idempotencyScope]idempotencyRecord
}

type idempotencyScope struct {
	userID uuid.UUID
	key    string
}

type idempotencyRecord struct {
	requestHash string
	result      repoDTO.CreateOfferResult
}

func NewTradeOfferStubRepository() *TradeOfferStubRepository {
	return &TradeOfferStubRepository{
		offers:          make(map[uuid.UUID]repoDTO.CreateOfferParams),
		idempotencyKeys: make(map[idempotencyScope]idempotencyRecord),
	}
}

func (r *TradeOfferStubRepository) CreateOffer(
	ctx context.Context,
	params repoDTO.CreateOfferParams,
	idempotency repoDTO.IdempotencyParams,
) (*repoDTO.CreateOfferResult, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	if err := ctx.Err(); err != nil {
		return nil, err
	}

	scope := idempotencyScope{userID: params.UserID, key: idempotency.Key}
	if idempotency.Key != "" {
		if record, ok := r.idempotencyKeys[scope]; ok {
			if record.requestHash != idempotency.RequestHash {
				return nil, repoDTO.ErrIdempotencyConflict
			}

			result := record.result
			result.Replayed = true

			return &result, nil
		}
	}

	offeredItemID := uuid.New()
	desiredItemID := uuid.New()

	// Сохраняем в память для проверки
	r.offers[offeredItemID] = params

	result := repoDTO.CreateOfferResult{
		OfferedItemID: offeredItemID,
		DesiredItemID: desiredItemID,
		Status:        "active",
		CreatedAt:     time.Now(),
	}

	if idempotency.Key != "" {
		r.idempotencyKeys[scope] = idempotencyRecord{
			requestHash: idempotency.RequestHash,
			result:      result,
		}
	}

	return &result, nil
}
