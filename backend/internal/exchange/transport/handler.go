package transport

import (
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/exchange/dto"
)

type ExchangeService interface {
	PostExchange(ctx context.Context, req dto.PostExchangeRequest) (*dto.PostExchangeResponse, error)
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
	var req dto.PostExchangeRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid request body: " + err.Error(),
		})
		return;
	}


	resp, err := h.service.PostExchange(c.Request.Context(), req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to create exchange offer: " + err.Error(),
		})
		return;
	}

	c.JSON(http.StatusCreated, resp)
}