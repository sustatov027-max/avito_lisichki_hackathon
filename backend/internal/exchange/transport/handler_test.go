package transport_test

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/exchange/dto"
	repoDTO "github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/exchange/repository"
	"github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/exchange/transport"
)

type MockExchangeService struct {
	mock.Mock
}

func (m *MockExchangeService) PostExchange(ctx context.Context, idempotencyKey string, req dto.PostExchangeRequest) (*dto.PostExchangeResponse, error) {
	args := m.Called(ctx, idempotencyKey, req)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*dto.PostExchangeResponse), args.Error(1)
}

func setupRouter(handler *transport.ExchangeHandler) *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	r.POST("/api/v1/exchange", handler.PostExchangeHandler)
	return r
}

func validHandlerRequest() dto.PostExchangeRequest {
	minP, maxP := 100, 200
	return dto.PostExchangeRequest{
		UserID:          "a0000000-0000-0000-0000-000000000001",
		CityName:        "Москва",
		DeliveryEnabled: true,
		OfferedItem: dto.OfferedItemRequest{
			Title:          "Комиксы Marvel",
			Description:    "10 томов",
			CategoryID:     "22222222-2222-2222-2222-222222222222",
			EstimatedPrice: 12000,
		},
		WantedItem: dto.WantedItemRequest{
			TitleQuery: "Смартфон",
			CategoryID: "11111111-1111-1111-1111-111111111111",
			MinPrice:   &minP,
			MaxPrice:   &maxP,
		},
	}
}

func executeRequest(router *gin.Engine, idempotencyKey string, body interface{}) *httptest.ResponseRecorder {
	var jsonPayload []byte
	if str, ok := body.(string); ok {
		jsonPayload = []byte(str)
	} else {
		jsonPayload, _ = json.Marshal(body)
	}

	req, _ := http.NewRequest(http.MethodPost, "/api/v1/exchange", bytes.NewBuffer(jsonPayload))
	req.Header.Set("Content-Type", "application/json")
	if idempotencyKey != "" {
		req.Header.Set("Idempotency-Key", idempotencyKey)
	}

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	return w
}

func TestPostExchangeHandler_Success(t *testing.T) {
	now := time.Now()
	reqBody := validHandlerRequest()

	t.Run("Успешное создание (201 Created)", func(t *testing.T) {
		mockSvc := new(MockExchangeService)
		mockSvc.On("PostExchange", mock.Anything, "test-key-123", reqBody).Return(&dto.PostExchangeResponse{
			ID:        "item-uuid-1",
			Status:    "active",
			CreatedAt: now,
			Replayed:  false,
		}, nil)

		router := setupRouter(transport.NewExchangeHandler(mockSvc))
		w := executeRequest(router, "test-key-123", reqBody)

		assert.Equal(t, http.StatusCreated, w.Code)
		assert.Empty(t, w.Header().Get("Idempotency-Replayed"))
		assert.Contains(t, w.Body.String(), `"id":"item-uuid-1"`)
		mockSvc.AssertExpectations(t)
	})

	t.Run("Повтор идемпотентного запроса", func(t *testing.T) {
		mockSvc := new(MockExchangeService)
		mockSvc.On("PostExchange", mock.Anything, "test-key-123", reqBody).Return(&dto.PostExchangeResponse{
			ID:        "item-uuid-1",
			Status:    "active",
			CreatedAt: now,
			Replayed:  true,
		}, nil)

		router := setupRouter(transport.NewExchangeHandler(mockSvc))
		w := executeRequest(router, "test-key-123", reqBody)

		assert.Equal(t, http.StatusCreated, w.Code)
		assert.Equal(t, "true", w.Header().Get("Idempotency-Replayed"))
		mockSvc.AssertExpectations(t)
	})
}

func TestPostExchangeHandler_BadRequest(t *testing.T) {
	mockSvc := new(MockExchangeService)
	router := setupRouter(transport.NewExchangeHandler(mockSvc))

	t.Run("Невалидный Idempotency-Key", func(t *testing.T) {
		w := executeRequest(router, "bad key with spaces\n", validHandlerRequest())
		assert.Equal(t, http.StatusBadRequest, w.Code)
		assert.Contains(t, w.Body.String(), "Idempotency-Key must contain")
	})

	t.Run("Некорректный JSON", func(t *testing.T) {
		w := executeRequest(router, "valid-key", "invalid json")
		assert.Equal(t, http.StatusBadRequest, w.Code)
		assert.Contains(t, w.Body.String(), "invalid request body")
	})

	t.Run("Отсутствует обязательное поле user_id", func(t *testing.T) {
		req := validHandlerRequest()
		req.UserID = ""
		w := executeRequest(router, "valid-key", req)
		assert.Equal(t, http.StatusBadRequest, w.Code)
		assert.Contains(t, w.Body.String(), "invalid request body")
	})
}

func TestPostExchangeHandler_ServerAndConflictErrors(t *testing.T) {
	reqBody := validHandlerRequest()

	t.Run("Конфликт идемпотентности (409 Conflict)", func(t *testing.T) {
		mockSvc := new(MockExchangeService)
		mockSvc.On("PostExchange", mock.Anything, "key-conflict", reqBody).
			Return(nil, repoDTO.ErrIdempotencyConflict)

		router := setupRouter(transport.NewExchangeHandler(mockSvc))
		w := executeRequest(router, "key-conflict", reqBody)

		assert.Equal(t, http.StatusConflict, w.Code)
		assert.Contains(t, w.Body.String(), repoDTO.ErrIdempotencyConflict.Error())
		mockSvc.AssertExpectations(t)
	})

	t.Run("Ошибка сервера (500 Internal Server Error)", func(t *testing.T) {
		mockSvc := new(MockExchangeService)
		mockSvc.On("PostExchange", mock.Anything, "valid-key", reqBody).
			Return(nil, errors.New("db connection failure"))

		router := setupRouter(transport.NewExchangeHandler(mockSvc))
		w := executeRequest(router, "valid-key", reqBody)

		assert.Equal(t, http.StatusInternalServerError, w.Code)
		assert.Contains(t, w.Body.String(), "failed to create exchange offer")
		mockSvc.AssertExpectations(t)
	})
}
