package transport

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/chain/dto"
)

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
