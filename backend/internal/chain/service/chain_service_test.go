package service_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/google/uuid"
	chains "github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/chain"
	"github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/chain/dto"
	repoDTO "github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/chain/repository"
	"github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/chain/service"
)

type chainRepositoryStub struct {
	chains []chains.Chain
	err    error
	chain  *chains.Chain

	// Поля для тестирования ProcessDecision
	processDecisionResult *repoDTO.ProcessDecisionResult
	processDecisionErr    error
	lastDecisionParams    repoDTO.ProcessDecisionParams
}

func (r *chainRepositoryStub) GetByUserID(
	_ context.Context,
	_ uuid.UUID,
) ([]chains.Chain, error) {
	return r.chains, r.err
}

func (r *chainRepositoryStub) GetByUserAndID(
	_ context.Context,
	_ uuid.UUID,
	_ uuid.UUID,
) (*chains.Chain, error) {
	return r.chain, r.err
}

func (r *chainRepositoryStub) ProcessDecision(
	_ context.Context,
	params repoDTO.ProcessDecisionParams,
) (*repoDTO.ProcessDecisionResult, error) {
	r.lastDecisionParams = params
	return r.processDecisionResult, r.processDecisionErr
}

// --- Тесты GetChains ---

func TestGetChainsMapsExpectedContract(t *testing.T) {
	currentUserID := uuid.New()
	otherUserID := uuid.New()
	chainID := uuid.New()
	createdAt := time.Now().UTC()
	svc := service.NewChainService(&chainRepositoryStub{chains: []chains.Chain{{
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
	}}})

	response, err := svc.GetChains(context.Background(), currentUserID.String())
	if err != nil {
		t.Fatalf("GetChains returned an error: %v", err)
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

func TestGetChainsRejectsInvalidUserID(t *testing.T) {
	svc := service.NewChainService(&chainRepositoryStub{})

	_, err := svc.GetChains(context.Background(), "")
	if !errors.Is(err, chains.ErrInvalidUserID) {
		t.Fatalf("expected ErrInvalidUserID, got %v", err)
	}
}

func TestGetChainMapsExpectedContract(t *testing.T) {
	currentUserID := uuid.New()
	otherUserID := uuid.New()
	chainID := uuid.New()

	svc := service.NewChainService(&chainRepositoryStub{chain: &chains.Chain{
		ID:          chainID,
		Status:      "proposed",
		ChainLength: 2,
		CreatedAt:   time.Now().UTC(),
		ExpiresAt:   time.Now().UTC().Add(time.Hour),
		Steps: []chains.Step{{
			Order:      1,
			FromUser:   chains.User{ID: currentUserID, Name: "Алексей", City: "Москва"},
			ToUser:     chains.User{ID: otherUserID, Name: "Иван", City: "Москва"},
			Item:       chains.Item{ID: uuid.New(), Title: "Телефон", CategoryID: uuid.New(), Photo: "phone.jpg", EstimatedPrice: 85000},
			IsAccepted: boolPointer(true),
		}, {
			Order:    2,
			FromUser: chains.User{ID: otherUserID, Name: "Иван", City: "Москва"},
			ToUser:   chains.User{ID: currentUserID, Name: "Алексей", City: "Москва"},
			Item:     chains.Item{ID: uuid.New(), Title: "Ноутбук", CategoryID: uuid.New(), EstimatedPrice: 80000},
		}},
	}})

	response, err := svc.GetChain(context.Background(), chainID.String(), currentUserID)
	if err != nil {
		t.Fatalf("GetChain returned an error: %v", err)
	}
	if response.ChainID != chainID.String() {
		t.Fatalf("unexpected response: %#v", response)
	}
}

func TestGetChainRejectsInvalidChainID(t *testing.T) {
	svc := service.NewChainService(&chainRepositoryStub{})

	_, err := svc.GetChain(context.Background(), "invalid-chain-id", uuid.New())
	if !errors.Is(err, chains.ErrInvalidChainID) {
		t.Fatalf("expected ErrInvalidChainID, got %v", err)
	}
}

// --- Тесты ProcessDecision ---

func TestProcessDecisionSuccess(t *testing.T) {
	chainID := uuid.New()
	userID := uuid.New()

	stub := &chainRepositoryStub{
		processDecisionResult: &repoDTO.ProcessDecisionResult{
			ChainID: chainID,
			Status:  "accepted",
		},
	}
	svc := service.NewChainService(stub)

	req := dto.DecisionRequest{Action: "accept"}
	res, err := svc.ProcessDecision(context.Background(), chainID.String(), userID, req)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if res.ChainID != chainID.String() || res.Status != "accepted" {
		t.Fatalf("unexpected response: %#v", res)
	}

	if stub.lastDecisionParams.ChainID != chainID || stub.lastDecisionParams.UserID != userID || stub.lastDecisionParams.Action != "accept" {
		t.Fatalf("unexpected repo params: %#v", stub.lastDecisionParams)
	}
}

func TestProcessDecisionInvalidChainID(t *testing.T) {
	svc := service.NewChainService(&chainRepositoryStub{})

	_, err := svc.ProcessDecision(context.Background(), "invalid-uuid", uuid.New(), dto.DecisionRequest{Action: "accept"})
	if err == nil {
		t.Fatal("expected error for invalid chain_id, got nil")
	}
}

func TestProcessDecisionRepositoryError(t *testing.T) {
	expectedErr := errors.New("database error")
	stub := &chainRepositoryStub{
		processDecisionErr: expectedErr,
	}
	svc := service.NewChainService(stub)

	_, err := svc.ProcessDecision(context.Background(), uuid.New().String(), uuid.New(), dto.DecisionRequest{Action: "reject"})
	if !errors.Is(err, expectedErr) {
		t.Fatalf("expected %v, got %v", expectedErr, err)
	}
}

func boolPointer(value bool) *bool {
	return &value
}
