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

func (r chainRepositoryStub) GetByID(
	_ context.Context,
	_ uuid.UUID,
	_ uuid.UUID,
) (*chains.Chain, error) {
	return r.chain, r.err
}

func TestGetChainMapsExpectedContract(t *testing.T) {
	currentUserID := uuid.New()
	otherUserID := uuid.New()
	chainID := uuid.New()
	createdAt := time.Now().UTC()
	svc := service.NewChainService(chainRepositoryStub{chain: &chains.Chain{
		ID:          chainID,
		Status:      "proposed",
		ChainLength: 2,
		CreatedAt:   createdAt,
		ExpiresAt:   createdAt.Add(time.Hour),
		Steps: []chains.Step{
			{
				Order:    1,
				FromUser: chains.User{ID: currentUserID, Name: "Алексей", City: "Москва"},
				ToUser:   chains.User{ID: otherUserID, Name: "Иван", City: "Москва"},
				Item: chains.Item{
					ID: uuid.New(), Title: "Телефон", CategoryID: uuid.New(),
					Photo: "phone.jpg", EstimatedPrice: 85000,
				},
				IsAccepted: boolPointer(true),
			},
			{
				Order:    2,
				FromUser: chains.User{ID: otherUserID, Name: "Иван", City: "Москва"},
				ToUser:   chains.User{ID: currentUserID, Name: "Алексей", City: "Москва"},
				Item:     chains.Item{ID: uuid.New(), Title: "Ноутбук", CategoryID: uuid.New(), EstimatedPrice: 80000},
			},
		},
	}})

	response, err := svc.GetChain(context.Background(), chainID.String(), currentUserID.String())
	if err != nil {
		t.Fatalf("GetChain returned an error: %v", err)
	}
	if len(response.Chains) != 1 || response.Chains[0].ChainID != chainID.String() {
		t.Fatalf("unexpected response: %#v", response)
	}
	chain := response.Chains[0]
	if chain.MySummary.MyDecision != "pending" || !chain.MySummary.UserActionRequired {
		t.Fatalf("unexpected summary: %#v", chain.MySummary)
	}
	if chain.Steps[0].FromUser.Name != "Вы (Алексей)" || !chain.Steps[0].FromUser.IsMe {
		t.Fatalf("current user was not marked: %#v", chain.Steps[0].FromUser)
	}
	if chain.MySummary.ReceivingItem.FromUser.Name != "Иван" {
		t.Fatalf("unexpected receiving user: %#v", chain.MySummary.ReceivingItem.FromUser)
	}
}

func TestGetChainRejectsInvalidIDs(t *testing.T) {
	svc := service.NewChainService(chainRepositoryStub{})
	validID := uuid.New().String()

	_, err := svc.GetChain(context.Background(), "not-a-uuid", validID)
	if !errors.Is(err, chains.ErrInvalidChainID) {
		t.Fatalf("expected ErrInvalidChainID, got %v", err)
	}
	_, err = svc.GetChain(context.Background(), validID, "")
	if !errors.Is(err, chains.ErrInvalidUserID) {
		t.Fatalf("expected ErrInvalidUserID, got %v", err)
	}
}

func boolPointer(value bool) *bool {
	return &value
}
