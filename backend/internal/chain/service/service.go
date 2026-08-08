package service

import (
	"context"

	"github.com/google/uuid"
	chains "github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/chain"
	repoDTO "github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/chain/repository"
)

type ChainRepository interface {
	GetByUserID(ctx context.Context, userID uuid.UUID) ([]chains.Chain, error)
	GetByUserAndID(ctx context.Context, chainID uuid.UUID, userID uuid.UUID) (*chains.Chain, error)
	ProcessDecision(ctx context.Context, params repoDTO.ProcessDecisionParams) (*repoDTO.ProcessDecisionResult, error)
}

type ChainService struct {
	repository ChainRepository
}

func NewChainService(repository ChainRepository) *ChainService {
	return &ChainService{repository: repository}
}
