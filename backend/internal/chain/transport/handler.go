package transport

import (
	"context"
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	chains "github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/chain"
	"github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/chain/dto"
)

type ChainService interface {
	GetChains(ctx context.Context, userID string) (*dto.GetChainsResponse, error)
}

type ChainHandler struct {
	service ChainService
}

func NewChainHandler(service ChainService) *ChainHandler {
	return &ChainHandler{service: service}
}

func (h *ChainHandler) GetChainsHandler(c *gin.Context) {
	response, err := h.service.GetChains(
		c.Request.Context(),
		c.GetHeader("X-User-ID"),
	)
	if err != nil {
		switch {
		case errors.Is(err, chains.ErrInvalidUserID):
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid or missing X-User-ID header"})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get chain"})
		}
		return
	}

	c.JSON(http.StatusOK, response)
}
