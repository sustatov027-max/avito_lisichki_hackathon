package transport_test

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/chains"
	"github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/chains/dto"
	"github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/chains/transport"
)

type chainServiceStub struct {
	response *dto.GetChainResponse
	err      error
}

func (s chainServiceStub) GetChain(_ context.Context, _ string) (*dto.GetChainResponse, error) {
	return s.response, s.err
}

func TestGetChainHandler(t *testing.T) {
	tests := []struct {
		name       string
		service    chainServiceStub
		wantStatus int
	}{
		{
			name:       "success",
			service:    chainServiceStub{response: &dto.GetChainResponse{ID: "chain-id", Steps: []dto.StepResponse{}}},
			wantStatus: http.StatusOK,
		},
		{
			name:       "invalid id",
			service:    chainServiceStub{err: chains.ErrInvalidID},
			wantStatus: http.StatusBadRequest,
		},
		{
			name:       "not found",
			service:    chainServiceStub{err: chains.ErrNotFound},
			wantStatus: http.StatusNotFound,
		},
		{
			name:       "internal error",
			service:    chainServiceStub{err: errors.New("database unavailable")},
			wantStatus: http.StatusInternalServerError,
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			gin.SetMode(gin.TestMode)
			handler := transport.NewChainHandler(test.service)
			router := gin.New()
			router.GET("/api/v1/chains/:chain_id", handler.GetChainHandler)
			request := httptest.NewRequest(http.MethodGet, "/api/v1/chains/test-id", nil)
			response := httptest.NewRecorder()

			router.ServeHTTP(response, request)
			if response.Code != test.wantStatus {
				t.Fatalf("expected status %d, got %d: %s", test.wantStatus, response.Code, response.Body.String())
			}
		})
	}
}
