package transport

import (
	"context"
	"errors"
	"net/http"
	"unicode"

	"github.com/gin-gonic/gin"
	"github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/exchange/dto"
	repoDTO "github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/exchange/repository"
)

const idempotencyKeyHeader = "Idempotency-Key"

type ExchangeService interface {
	PostExchange(ctx context.Context, idempotencyKey string, req dto.PostExchangeRequest) (*dto.PostExchangeResponse, error)
}

type ExchangeHandler struct {
	service ExchangeService
}

func NewExchangeHandler(service ExchangeService) *ExchangeHandler {
	return &ExchangeHandler{
		service: service,
	}
}

func (h *ExchangeHandler) PostExchangeHandler(c *gin.Context) {
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

	if err := validatePostExchangeRequest(req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "validation failed: " + err.Error(),
		})
		return
	}

	resp, err := h.service.PostExchange(c.Request.Context(), idempotencyKey, req)
	if err != nil {
		if errors.Is(err, repoDTO.ErrIdempotencyConflict) {
			c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to create exchange offer: " + err.Error(),
		})
		return
	}

	if resp.Replayed {
		c.Header("Idempotency-Replayed", "true")
	}

	c.JSON(http.StatusCreated, resp)
}

func validatePostExchangeRequest(req dto.PostExchangeRequest) error {
	if req.UserID == "" {
		return errors.New("user_id is required")
	}
	if req.CityName == "" {
		return errors.New("city_name is required")
	}
	if req.OfferedItem.Title == "" {
		return errors.New("offered_item.title is required")
	}
	if req.OfferedItem.CategoryID == "" {
		return errors.New("offered_item.category_id is required")
	}
	if req.OfferedItem.EstimatedPrice < 0 {
		return errors.New("offered_item.estimated_price must be non-negative")
	}
	if req.WantedItem.MinPrice != nil && req.WantedItem.MaxPrice != nil {
		if *req.WantedItem.MinPrice > *req.WantedItem.MaxPrice {
			return errors.New("wanted_item.min_price cannot be greater than wanted_item.max_price")
		}
	}
	return nil
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
