package service

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	chains "github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/chain"
	"github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/chain/dto"
)

type ChainRepository interface {
	GetByID(ctx context.Context, chainID uuid.UUID) (*chains.Chain, error)
}

type ChainService struct {
	repository ChainRepository
}

func NewChainService(repository ChainRepository) *ChainService {
	return &ChainService{repository: repository}
}

func (s *ChainService) GetChain(ctx context.Context, rawChainID string) (*dto.GetChainResponse, error) {
	chainID, err := uuid.Parse(rawChainID)
	if err != nil {
		return nil, fmt.Errorf("%w: %s", chains.ErrInvalidID, rawChainID)
	}

	chain, err := s.repository.GetByID(ctx, chainID)
	if err != nil {
		return nil, fmt.Errorf("get chain: %w", err)
	}

	return mapChainToResponse(chain), nil
}

func mapChainToResponse(chain *chains.Chain) *dto.GetChainResponse {
	steps := make([]dto.StepResponse, 0, len(chain.Steps))
	for _, step := range chain.Steps {
		steps = append(steps, dto.StepResponse{
			ID:             step.ID.String(),
			Order:          step.Order,
			FromUserID:     step.FromUserID.String(),
			ToUserID:       step.ToUserID.String(),
			OfferedItemID:  step.OfferedItemID.String(),
			ReceivedItemID: step.ReceivedItemID.String(),
			IsAccepted:     step.IsAccepted,
		})
	}

	return &dto.GetChainResponse{
		ID:          chain.ID.String(),
		Status:      chain.Status,
		ChainLength: chain.ChainLength,
		CreatedAt:   chain.CreatedAt,
		UpdatedAt:   chain.UpdatedAt,
		Steps:       steps,
	}
}
