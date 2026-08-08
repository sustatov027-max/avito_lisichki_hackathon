package transport

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
	"github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/exchange/dto"
	repoDTO "github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/exchange/repository"
)

type MockExchangeService struct {
	mock.Mock
}

func (m *MockExchangeService) PostExchange(ctx context.Context, userID uuid.UUID, key string, req dto.PostExchangeRequest) (*dto.PostExchangeResponse, error) {
	args := m.Called(ctx, userID, key, req)
	if res := args.Get(0); res != nil {
		return res.(*dto.PostExchangeResponse), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockExchangeService) GetMyOffers(ctx context.Context, userID uuid.UUID) (*dto.GetMyOffersResponse, error) {
	args := m.Called(ctx, userID)
	if res := args.Get(0); res != nil {
		return res.(*dto.GetMyOffersResponse), args.Error(1)
	}
	return nil, args.Error(1)
}

func setupTestRouter() (*gin.Engine, *MockExchangeService, *ExchangeHandler) {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	mockSvc := new(MockExchangeService)
	handler := NewExchangeHandler(mockSvc)
	return router, mockSvc, handler
}

type postExchangeTestCase struct {
	name           string
	setContext     func(c *gin.Context)
	headers        map[string]string
	body           interface{}
	mockSetup      func(svc *MockExchangeService)
	expectedStatus int
	expectedHeader map[string]string
}

func getPostExchangeAuthCases(validUserID uuid.UUID) []postExchangeTestCase {
	return []postExchangeTestCase{
		{
			name:           "Unauthorized - missing user context",
			setContext:     func(c *gin.Context) {},
			expectedStatus: http.StatusUnauthorized,
		},
		{
			name: "Internal Error - invalid user context type",
			setContext: func(c *gin.Context) {
				c.Set("user_id", "invalid-uuid-string")
			},
			expectedStatus: http.StatusInternalServerError,
		},
		{
			name: "Bad Request - invalid idempotency key",
			setContext: func(c *gin.Context) {
				c.Set("user_id", validUserID)
			},
			headers:        map[string]string{idempotencyKeyHeader: "invalid key with space"},
			expectedStatus: http.StatusBadRequest,
		},
		{
			name: "Bad Request - invalid JSON body",
			setContext: func(c *gin.Context) {
				c.Set("user_id", validUserID)
			},
			body:           "invalid-json",
			expectedStatus: http.StatusBadRequest,
		},
	}
}

func getPostExchangeServiceCases(validUserID uuid.UUID, validReq dto.PostExchangeRequest) []postExchangeTestCase {
	return []postExchangeTestCase{
		{
			name: "Conflict - idempotency conflict",
			setContext: func(c *gin.Context) {
				c.Set("user_id", validUserID)
			},
			body: validReq,
			mockSetup: func(svc *MockExchangeService) {
				svc.On("PostExchange", mock.Anything, validUserID, "", validReq).
					Return(nil, repoDTO.ErrIdempotencyConflict)
			},
			expectedStatus: http.StatusConflict,
		},
		{
			name: "Internal Error - service failure",
			setContext: func(c *gin.Context) {
				c.Set("user_id", validUserID)
			},
			body: validReq,
			mockSetup: func(svc *MockExchangeService) {
				svc.On("PostExchange", mock.Anything, validUserID, "", validReq).
					Return(nil, errors.New("db error"))
			},
			expectedStatus: http.StatusInternalServerError,
		},
		{
			name: "Success - created without replay header",
			setContext: func(c *gin.Context) {
				c.Set("user_id", validUserID)
			},
			body: validReq,
			mockSetup: func(svc *MockExchangeService) {
				svc.On("PostExchange", mock.Anything, validUserID, "", validReq).
					Return(&dto.PostExchangeResponse{Replayed: false}, nil)
			},
			expectedStatus: http.StatusCreated,
		},
		{
			name: "Success - created with replayed header",
			setContext: func(c *gin.Context) {
				c.Set("user_id", validUserID)
			},
			headers: map[string]string{idempotencyKeyHeader: "valid-key-123"},
			body:    validReq,
			mockSetup: func(svc *MockExchangeService) {
				svc.On("PostExchange", mock.Anything, validUserID, "valid-key-123", validReq).
					Return(&dto.PostExchangeResponse{Replayed: true}, nil)
			},
			expectedStatus: http.StatusCreated,
			expectedHeader: map[string]string{"Idempotency-Replayed": "true"},
		},
	}
}

func getPostExchangeCases() []postExchangeTestCase {
	validUserID := uuid.New()

	validReq := dto.PostExchangeRequest{
		CityName:        "Москва",
		DeliveryEnabled: true,
		OfferedItem: dto.OfferedItem{
			Title:          "Горный велосипед",
			CategoryID:     uuid.New().String(),
			EstimatedPrice: 45000,
		},
		WantedItem: dto.WantedItem{
			TitleQuery: "Игровая приставка",
			CategoryID: uuid.New().String(),
		},
	}

	cases := getPostExchangeAuthCases(validUserID)
	return append(cases, getPostExchangeServiceCases(validUserID, validReq)...)
}

func TestPostExchangeHandler(t *testing.T) {
	for _, tc := range getPostExchangeCases() {
		t.Run(tc.name, func(t *testing.T) {
			router, mockSvc, handler := setupTestRouter()

			router.POST("/exchange", func(c *gin.Context) {
				if tc.setContext != nil {
					tc.setContext(c)
				}
				handler.PostExchangeHandler(c)
			})

			var bodyBytes []byte
			if strBody, ok := tc.body.(string); ok {
				bodyBytes = []byte(strBody)
			} else if tc.body != nil {
				var err error
				bodyBytes, err = json.Marshal(tc.body)
				require.NoError(t, err)
			}

			req := httptest.NewRequest(http.MethodPost, "/exchange", bytes.NewBuffer(bodyBytes))
			req.Header.Set("Content-Type", "application/json")
			for k, v := range tc.headers {
				req.Header.Set(k, v)
			}

			if tc.mockSetup != nil {
				tc.mockSetup(mockSvc)
			}

			rec := httptest.NewRecorder()
			router.ServeHTTP(rec, req)

			assert.Equal(t, tc.expectedStatus, rec.Code)
			for k, v := range tc.expectedHeader {
				assert.Equal(t, v, rec.Header().Get(k))
			}
			mockSvc.AssertExpectations(t)
		})
	}
}
