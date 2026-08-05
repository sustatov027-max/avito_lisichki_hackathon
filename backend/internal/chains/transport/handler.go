package transport

import (
	"context"
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/chains"
	"github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/chains/dto"
)

type ChainService interface {
	GetChain(ctx context.Context, chainID string, userID string) (*dto.GetChainsResponse, error)
}

type ChainHandler struct {
	service ChainService
}

func NewChainHandler(service ChainService) *ChainHandler {
	return &ChainHandler{service: service}
}

func (h *ChainHandler) GetChainHandler(c *gin.Context) {
	response, err := h.service.GetChain(
		c.Request.Context(),
		c.Param("chain_id"),
		c.Query("user_id"),
	)
	if err != nil {
		switch {
		case errors.Is(err, chains.ErrInvalidChainID):
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid chain id"})
		case errors.Is(err, chains.ErrInvalidUserID):
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid or missing user_id"})
		case errors.Is(err, chains.ErrNotFound):
			c.JSON(http.StatusNotFound, gin.H{"error": "chain not found"})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get chain"})
		}
		return
	}

	c.JSON(http.StatusOK, response)
}
