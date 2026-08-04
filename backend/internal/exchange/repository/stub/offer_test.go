package stub_test

import (
	"context"
	"sync"
	"testing"

	"github.com/google/uuid"
	repository "github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/exchange/repository"
	"github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/exchange/repository/stub"
)

func TestCreateOfferConcurrentIdempotency(t *testing.T) {
	repo := stub.NewTradeOfferStubRepository()
	params := repository.CreateOfferParams{UserID: uuid.New()}
	idempotency := repository.IdempotencyParams{Key: "concurrent-key", RequestHash: "request-hash"}

	const requestCount = 20
	results := make(chan *repository.CreateOfferResult, requestCount)
	errors := make(chan error, requestCount)
	var waitGroup sync.WaitGroup

	for range requestCount {
		waitGroup.Add(1)
		go func() {
			defer waitGroup.Done()
			result, err := repo.CreateOffer(context.Background(), params, idempotency)
			if err != nil {
				errors <- err
				return
			}
			results <- result
		}()
	}

	waitGroup.Wait()
	close(results)
	close(errors)

	for err := range errors {
		t.Errorf("CreateOffer returned an error: %v", err)
	}

	var resourceID uuid.UUID
	createdCount := 0
	for result := range results {
		if resourceID == uuid.Nil {
			resourceID = result.OfferedItemID
		}
		if result.OfferedItemID != resourceID {
			t.Errorf("expected one resource ID, got %s and %s", resourceID, result.OfferedItemID)
		}
		if !result.Replayed {
			createdCount++
		}
	}
	if createdCount != 1 {
		t.Fatalf("expected exactly one creation, got %d", createdCount)
	}
}
