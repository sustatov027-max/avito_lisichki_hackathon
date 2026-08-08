package service

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	chains "github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/chain"
	"github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/chain/dto"
)

func (s *ChainService) GetChains(
	ctx context.Context,
	rawUserID string,
) (*dto.GetChainsResponse, error) {
	userID, err := parseUserID(rawUserID)
	if err != nil {
		return nil, err
	}

	userChains, err := s.repository.GetByUserID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("get user chains: %w", err)
	}

	responses := make([]dto.ChainResponse, 0, len(userChains))
	now := time.Now()
	for index := range userChains {
		response, err := mapChainToResponse(&userChains[index], userID, now)
		if err != nil {
			return nil, fmt.Errorf("map chain %s: %w", userChains[index].ID, err)
		}
		responses = append(responses, *response)
	}

	return &dto.GetChainsResponse{Chains: responses}, nil
}

func (s *ChainService) GetChain(
	ctx context.Context,
	rawChainID string,
	userID uuid.UUID,
) (*dto.ChainResponse, error) {
	chainID, err := parseChainID(rawChainID)
	if err != nil {
		return nil, err
	}

	chain, err := s.repository.GetByUserAndID(ctx, chainID, userID)
	if err != nil {
		return nil, fmt.Errorf("get user chain: %w", err)
	}

	now := time.Now()
	response, err := mapChainToResponse(chain, userID, now)
	if err != nil {
		return nil, fmt.Errorf("map chain %s: %w", chain.ID, err)
	}

	return response, nil
}

// --- Helper Functions ---

func parseUserID(rawID string) (uuid.UUID, error) {
	id, err := uuid.Parse(rawID)
	if err != nil {
		return uuid.Nil, fmt.Errorf("%w: %s", chains.ErrInvalidUserID, rawID)
	}

	return id, nil
}

func parseChainID(rawID string) (uuid.UUID, error) {
	id, err := uuid.Parse(rawID)
	if err != nil {
		return uuid.Nil, fmt.Errorf("%w: %s", chains.ErrInvalidChainID, rawID)
	}

	return id, nil
}

func mapChainToResponse(
	chain *chains.Chain,
	userID uuid.UUID,
	now time.Time,
) (*dto.ChainResponse, error) {
	steps := make([]dto.StepResponse, 0, len(chain.Steps))
	var givingStep, receivingStep *chains.Step
	for index := range chain.Steps {
		step := &chain.Steps[index]
		steps = append(steps, mapStep(*step, userID))
		if step.FromUser.ID == userID {
			givingStep = step
		}
		if step.ToUser.ID == userID {
			receivingStep = step
		}
	}
	if givingStep == nil || receivingStep == nil {
		return nil, chains.ErrIncomplete
	}

	timeLeft := max(int64(chain.ExpiresAt.Sub(now).Seconds()), 0)
	decision := mapDecision(receivingStep.IsAccepted)

	return &dto.ChainResponse{
		ChainID:     chain.ID.String(),
		Status:      chain.Status,
		ChainLength: chain.ChainLength,
		CreatedAt:   chain.CreatedAt,
		ExpiresAt:   chain.ExpiresAt,
		TimeLeft:    timeLeft,
		MySummary:   mapSummary(*givingStep, *receivingStep, decision, timeLeft),
		Steps:       steps,
	}, nil
}

func mapStep(step chains.Step, userID uuid.UUID) dto.StepResponse {
	return dto.StepResponse{
		Order:      step.Order,
		FromUser:   mapUser(step.FromUser, userID),
		ToUser:     mapUser(step.ToUser, userID),
		Item:       mapItem(step.Item),
		IsAccepted: step.IsAccepted,
	}
}

func mapUser(user chains.User, currentUserID uuid.UUID) dto.UserResponse {
	isMe := user.ID == currentUserID
	name := user.Name
	if isMe {
		name = "Вы (" + name + ")"
	}

	return dto.UserResponse{
		ID:   user.ID.String(),
		Name: name,
		City: user.City,
		IsMe: isMe,
	}
}

func mapItem(item chains.Item) dto.ItemResponse {
	return dto.ItemResponse{
		ID:         item.ID.String(),
		Title:      item.Title,
		CategoryID: item.CategoryID.String(),
		Photo:      item.Photo,
	}
}

func mapSummary(
	givingStep chains.Step,
	receivingStep chains.Step,
	decision string,
	timeLeft int64,
) dto.MySummaryResponse {
	return dto.MySummaryResponse{
		UserActionRequired: decision == "pending" && timeLeft > 0,
		MyDecision:         decision,
		GivingItem:         mapItemSummary(givingStep.Item),
		ReceivingItem: dto.ReceivedItem{
			ItemSummary: mapItemSummary(receivingStep.Item),
			FromUser: dto.UserSummary{
				ID:   receivingStep.FromUser.ID.String(),
				Name: receivingStep.FromUser.Name,
				City: receivingStep.FromUser.City,
			},
		},
	}
}

func mapItemSummary(item chains.Item) dto.ItemSummary {
	return dto.ItemSummary{
		ID:             item.ID.String(),
		Title:          item.Title,
		Photo:          item.Photo,
		EstimatedPrice: item.EstimatedPrice,
	}
}

func mapDecision(accepted *bool) string {
	if accepted == nil {
		return "pending"
	}
	if *accepted {
		return "accepted"
	}

	return "rejected"
}
