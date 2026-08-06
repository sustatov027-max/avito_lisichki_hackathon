package transport

import (
	"context"
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/chain/dto"
	repoDTO "github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/chain/repository"
)

type ChainService interface {
	GetChains(ctx context.Context, userID string) (*dto.GetChainsResponse, error)
	ProcessDecision(ctx context.Context, chainIDStr string, userID uuid.UUID, req dto.DecisionRequest) (*dto.DecisionResponse, error)
}

type ChainHandler struct {
	service ChainService
}

func NewChainHandler(service ChainService) *ChainHandler {
	return &ChainHandler{service: service}
}

func (h *ChainHandler) handleError(c *gin.Context, err error) {
	switch {
	case errors.Is(err, repoDTO.ErrChainNotFound):
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
	case errors.Is(err, repoDTO.ErrStepNotFound):
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
	case errors.Is(err, repoDTO.ErrChainNotProposed),
		errors.Is(err, repoDTO.ErrAlreadyDecided),
		errors.Is(err, repoDTO.ErrInvalidAction):
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
	default:
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to process chain decision: " + err.Error(),
		})
	}
}
