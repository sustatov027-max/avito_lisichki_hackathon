package transport

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	chains "github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/chain"
)

func (h *ChainHandler) GetChainsHandler(c *gin.Context) {
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

	response, err := h.service.GetChains(
		c.Request.Context(),
		userID.String(),
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
