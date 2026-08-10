package transport

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// GetMyOffersHandler returns offers created by the authenticated user
// @Summary Get my offers
// @Description Returns offers created by current user
// @Tags Exchange
// @Accept json
// @Produce json
// @Param X-User-ID header string true "User ID (UUID). Example: 123e4567-e89b-12d3-a456-426614174000"
// @Success 200 {object} dto.GetMyOffersResponse "List of user offers"
// @Failure 401 {object} map[string]string "Unauthorized"
// @Failure 500 {object} map[string]string "Internal server error"
// @Router /api/v1/offers/my [get]
func (h *ExchangeHandler) GetMyOffersHandler(c *gin.Context) {
	userIDValue, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized: missing user context"})
		return
	}

	userID, ok := userIDValue.(uuid.UUID)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "invalid user context type"})
		return
	}

	response, err := h.service.GetMyOffers(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get user offers"})
		return
	}

	c.JSON(http.StatusOK, response)
}
