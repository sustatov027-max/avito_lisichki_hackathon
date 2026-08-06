package transport_test

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	chains "github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/chain"
	"github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/chain/dto"
	"github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/chain/transport"
)

type chainServiceStub struct {
	response *dto.GetChainsResponse
	err      error
}

func (s chainServiceStub) GetChains(
	_ context.Context,
	_ string,
) (*dto.GetChainsResponse, error) {
	return s.response, s.err
}

func TestGetChainsHandler(t *testing.T) {
	tests := []struct {
		name       string
		service    chainServiceStub
		wantStatus int
	}{
		{
			name: "success",
			service: chainServiceStub{response: &dto.GetChainsResponse{
				Chains: []dto.ChainResponse{},
			}},
			wantStatus: http.StatusOK,
		},
		{name: "invalid user id", service: chainServiceStub{err: chains.ErrInvalidUserID}, wantStatus: http.StatusBadRequest},
		{name: "internal error", service: chainServiceStub{err: errors.New("database unavailable")}, wantStatus: http.StatusInternalServerError},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			gin.SetMode(gin.TestMode)
			handler := transport.NewChainHandler(test.service)
			router := gin.New()
			router.GET("/api/v1/chains", handler.GetChainsHandler)
			request := httptest.NewRequest(http.MethodGet, "/api/v1/chains", nil)
			request.Header.Set("X-User-ID", "test-user")
			response := httptest.NewRecorder()

			router.ServeHTTP(response, request)
			if response.Code != test.wantStatus {
				t.Fatalf("expected status %d, got %d: %s", test.wantStatus, response.Code, response.Body.String())
			}
		})
	}
}
