package transport

import (
	"errors"
	"net/http"
	"unicode"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/exchange/dto"
	repoDTO "github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/exchange/repository"
)

// PostExchangeHandler creates a new exchange offer
// @Summary Create exchange offer
// @Description Create a new offer (idempotent with Idempotency-Key header)
// @Tags Exchange
// @Accept json
// @Produce json
// @Param X-User-ID header string true "User ID (UUID). Example: 123e4567-e89b-12d3-a456-426614174000"
// @Param Idempotency-Key header string false "Idempotency key"
// @Param request body dto.PostExchangeRequest true "Post exchange request. Example: {\"city_name\":\"Moscow\",\"delivery_enabled\":false,\"offered_item\":{\"title\":\"Vintage Camera\",\"category_id\":\"electronics-vintage\"},\"wanted_item\":{\"title_query\":\"camera\"}}"
// @Success 201 {object} dto.PostExchangeResponse "Created"
// @Failure 400 {object} map[string]string "Bad request"
// @Failure 401 {object} map[string]string "Unauthorized"
// @Failure 404 {object} map[string]string "Not found"
// @Failure 409 {object} map[string]string "Conflict"
// @Failure 500 {object} map[string]string "Internal server error"
// @Router /api/v1/offers [post]
func (h *ExchangeHandler) PostExchangeHandler(c *gin.Context) {
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

	idempotencyKey := c.GetHeader(idempotencyKeyHeader)
	if !validIdempotencyKey(idempotencyKey) {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Idempotency-Key must contain 1 to 255 non-whitespace printable ASCII characters",
		})
		return
	}

	var req dto.PostExchangeRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid request body: " + err.Error(),
		})
		return
	}

	resp, err := h.service.PostExchange(c.Request.Context(), userID, idempotencyKey, req)
	if err != nil {
		switch {
		case errors.Is(err, repoDTO.ErrInvalidRequest):
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		case errors.Is(err, repoDTO.ErrUserNotFound):
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		case errors.Is(err, repoDTO.ErrDuplicateOffer),
			errors.Is(err, repoDTO.ErrIdempotencyConflict):
			c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
			return
		default:
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "failed to create exchange offer: " + err.Error(),
			})
			return
		}
	}

	if resp.Replayed {
		c.Header("Idempotency-Replayed", "true")
	}

	c.JSON(http.StatusCreated, resp)
}

func validIdempotencyKey(key string) bool {
	if key == "" {
		return true
	}
	if len(key) > 255 {
		return false
	}

	for _, char := range key {
		if char > unicode.MaxASCII || !unicode.IsPrint(char) || unicode.IsSpace(char) {
			return false
		}
	}

	return true
}
