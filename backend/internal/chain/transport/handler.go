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
	ProcessDecision(ctx context.Context, chainIDStr string, userID uuid.UUID, req dto.DecisionRequest) (*dto.DecisionResponse, error)
}

type ChainHandler struct {
	service ChainService
}

func NewChainHandler(service ChainService) *ChainHandler {
	return &ChainHandler{
		service: service,
	}
}

func (h *ChainHandler) ProcessDecisionHandler(c *gin.Context) {
	chainID := c.Param("chain_id")
	if chainID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "chain_id parameter is required",
		})
		return
	}

	userIDVal, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "unauthorized: missing user context",
		})
		return
	}

	userID, ok := userIDVal.(uuid.UUID)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "invalid user context type",
		})
		return
	}

	var req dto.DecisionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid request body: " + err.Error(),
		})
		return
	}

	resp, err := h.service.ProcessDecision(c.Request.Context(), chainID, userID, req)
	if err != nil {
		h.handleError(c, err)
		return
	}

	c.JSON(http.StatusOK, resp)
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
