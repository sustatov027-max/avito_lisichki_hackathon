package transport

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	chains "github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/chain"
	repoDTO "github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/chain/repository"
)

func (h *ChainHandler) GetChainHandler(c *gin.Context) {
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

	response, err := h.service.GetChain(c.Request.Context(), chainID, userID)
	if err != nil {
		switch {
		case errors.Is(err, chains.ErrInvalidUserID):
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid or missing X-User-ID header"})
		case errors.Is(err, chains.ErrInvalidChainID):
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid chain_id parameter"})
		case errors.Is(err, repoDTO.ErrChainNotFound):
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		case errors.Is(err, repoDTO.ErrStepNotFound):
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get chain"})
		}
		return
	}

	c.JSON(http.StatusOK, response)
}
