package transport

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/chain/dto"
)

// ProcessDecisionHandler handles processing a user's decision (accept/reject) on a chain
// @Summary Process decision on chain
// @Description Process accept or reject decision for a chain.
// @Tags Chain
// @Accept json
// @Produce json
// @Param chain_id path string true "Chain ID"
// @Param X-User-ID header string true "User ID (UUID). Example: 123e4567-e89b-12d3-a456-426614174000"
// @Param request body dto.DecisionRequest true "Decision request. Example: {\"action\":\"accept\"}"
// @Success 200 {object} dto.DecisionResponse "Successful response. Example: {\"chain_id\":\"123e4567-e89b-12d3-a456-426614174000\", \"status\":\"processed\", \"message\":\"Decision accepted\"}"
// @Failure 400 {object} map[string]string "Bad request"
// @Failure 401 {object} map[string]string "Unauthorized"
// @Failure 500 {object} map[string]string "Internal server error"
// @Router /api/v1/chains/{chain_id}/decision [post]
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
