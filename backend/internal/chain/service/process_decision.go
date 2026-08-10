package service

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/chain/dto"
	repoDTO "github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/chain/repository"
)

func (s *ChainService) ProcessDecision(
	ctx context.Context,
	chainIDStr string,
	userID uuid.UUID,
	req dto.DecisionRequest,
) (*dto.DecisionResponse, error) {
	params, err := buildProcessDecisionParams(chainIDStr, userID, req)
	if err != nil {
		return nil, fmt.Errorf("build decision params: %w", err)
	}

	res, err := s.repository.ProcessDecision(ctx, params)
	if err != nil {
		return nil, err
	}

	return buildDecisionResponse(res), nil
}

// --- Helper Functions ---

func buildProcessDecisionParams(
	chainIDStr string,
	userID uuid.UUID,
	req dto.DecisionRequest,
) (repoDTO.ProcessDecisionParams, error) {
	chainID, err := uuid.Parse(chainIDStr)
	if err != nil {
		return repoDTO.ProcessDecisionParams{}, fmt.Errorf("invalid chain_id UUID: %w", err)
	}

	return repoDTO.ProcessDecisionParams{
		ChainID: chainID,
		UserID:  userID,
		Action:  req.Action,
	}, nil
}

func buildDecisionResponse(res *repoDTO.ProcessDecisionResult) *dto.DecisionResponse {
	msg := "Decision recorded successfully"
	if res.Status == "rejected" {
		msg = "Chain exchange rejected successfully"
	}

	return &dto.DecisionResponse{
		ChainID: res.ChainID.String(),
		Status:  res.Status,
		Message: msg,
	}
}
