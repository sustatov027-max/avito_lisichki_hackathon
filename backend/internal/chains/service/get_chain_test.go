package service_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/chains"
	"github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/chains/service"
)

type chainRepositoryStub struct {
	chain *chains.Chain
	err   error
}

func (r chainRepositoryStub) GetByID(_ context.Context, _ uuid.UUID) (*chains.Chain, error) {
	return r.chain, r.err
}

func TestGetChainMapsDomainModel(t *testing.T) {
	accepted := true
	chainID := uuid.New()
	stepID := uuid.New()
	createdAt := time.Now().UTC()
	svc := service.NewChainService(chainRepositoryStub{chain: &chains.Chain{
		ID:          chainID,
		Status:      "proposed",
		ChainLength: 2,
		CreatedAt:   createdAt,
		UpdatedAt:   createdAt,
		Steps: []chains.Step{{
			ID:             stepID,
			Order:          1,
			FromUserID:     uuid.New(),
			ToUserID:       uuid.New(),
			OfferedItemID:  uuid.New(),
			ReceivedItemID: uuid.New(),
			IsAccepted:     &accepted,
		}},
	}})

	response, err := svc.GetChain(context.Background(), chainID.String())
	if err != nil {
		t.Fatalf("GetChain returned an error: %v", err)
	}
	if response.ID != chainID.String() || len(response.Steps) != 1 {
		t.Fatalf("unexpected response: %#v", response)
	}
	if response.Steps[0].ID != stepID.String() || response.Steps[0].IsAccepted == nil || !*response.Steps[0].IsAccepted {
		t.Fatalf("unexpected step response: %#v", response.Steps[0])
	}
}

func TestGetChainRejectsInvalidID(t *testing.T) {
	svc := service.NewChainService(chainRepositoryStub{})

	_, err := svc.GetChain(context.Background(), "not-a-uuid")
	if err == nil {
		t.Fatal("expected an error")
	}
	if !errors.Is(err, chains.ErrInvalidID) {
		t.Fatalf("expected ErrInvalidID, got %v", err)
	}
}
