package transport_test

import (
	"bytes"
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/chain/dto"
	repoDTO "github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/chain/repository"
	"github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/chain/transport"
	"github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/platform/middleware"
)

type chainServiceStub struct {
	getChainsResp   *dto.GetChainsResponse
	getChainsErr    error
	processDecResp  *dto.DecisionResponse
	processDecErr   error
	lastChainID     string
	lastUserID      uuid.UUID
	lastDecisionReq dto.DecisionRequest
}

func (s *chainServiceStub) GetChains(
	_ context.Context,
	_ string,
) (*dto.GetChainsResponse, error) {
	return s.getChainsResp, s.getChainsErr
}

func (s *chainServiceStub) ProcessDecision(
	_ context.Context,
	chainIDStr string,
	userID uuid.UUID,
	req dto.DecisionRequest,
) (*dto.DecisionResponse, error) {
	s.lastChainID = chainIDStr
	s.lastUserID = userID
	s.lastDecisionReq = req
	return s.processDecResp, s.processDecErr
}

// --- Тесты GetChainsHandler ---

func TestGetChainsHandler(t *testing.T) {
	validUserID := uuid.New().String()

	tests := []struct {
		name         string
		userIDHeader string
		service      *chainServiceStub
		wantStatus   int
	}{
		{
			name:         "success",
			userIDHeader: validUserID,
			service: &chainServiceStub{getChainsResp: &dto.GetChainsResponse{
				Chains: []dto.ChainResponse{},
			}},
			wantStatus: http.StatusOK,
		},
		{
			name:         "missing header (unauthorized)",
			userIDHeader: "",
			service:      &chainServiceStub{},
			wantStatus:   http.StatusUnauthorized,
		},
		{
			name:         "invalid uuid in header (unauthorized)",
			userIDHeader: "invalid-uuid",
			service:      &chainServiceStub{},
			wantStatus:   http.StatusUnauthorized,
		},
		{
			name:         "internal error",
			userIDHeader: validUserID,
			service:      &chainServiceStub{getChainsErr: errors.New("database unavailable")},
			wantStatus:   http.StatusInternalServerError,
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			gin.SetMode(gin.TestMode)
			handler := transport.NewChainHandler(test.service)

			router := gin.New()
			api := router.Group("/api/v1")
			api.Use(middleware.DummyAuthMiddleware())
			{
				api.GET("/offers/my", handler.GetChainsHandler)
			}

			request := httptest.NewRequest(http.MethodGet, "/api/v1/offers/my", nil)
			if test.userIDHeader != "" {
				request.Header.Set("X-User-ID", test.userIDHeader)
			}
			response := httptest.NewRecorder()

			router.ServeHTTP(response, request)
			if response.Code != test.wantStatus {
				t.Fatalf("expected status %d, got %d: %s", test.wantStatus, response.Code, response.Body.String())
			}
		})
	}
}

// --- Тесты ProcessDecisionHandler ---

type processDecisionTestCase struct {
	name         string
	chainIDParam string
	userIDHeader string
	body         string
	service      *chainServiceStub
	wantStatus   int
}

func getProcessDecisionTestCases(testUserID uuid.UUID, testChainID string) []processDecisionTestCase {
	return []processDecisionTestCase{
		{
			name:         "success accept decision",
			chainIDParam: testChainID,
			userIDHeader: testUserID.String(),
			body:         `{"action":"accept"}`,
			service: &chainServiceStub{
				processDecResp: &dto.DecisionResponse{
					ChainID: testChainID,
					Status:  "accepted",
					Message: "Decision recorded successfully",
				},
			},
			wantStatus: http.StatusOK,
		},
		{
			name:         "missing X-User-ID header",
			chainIDParam: testChainID,
			userIDHeader: "",
			body:         `{"action":"accept"}`,
			service:      &chainServiceStub{},
			wantStatus:   http.StatusUnauthorized,
		},
		{
			name:         "invalid X-User-ID header format",
			chainIDParam: testChainID,
			userIDHeader: "not-a-valid-uuid",
			body:         `{"action":"accept"}`,
			service:      &chainServiceStub{},
			wantStatus:   http.StatusUnauthorized,
		},
		{
			name:         "invalid json body",
			chainIDParam: testChainID,
			userIDHeader: testUserID.String(),
			body:         `{"action":}`,
			service:      &chainServiceStub{},
			wantStatus:   http.StatusBadRequest,
		},
		{
			name:         "chain not found",
			chainIDParam: testChainID,
			userIDHeader: testUserID.String(),
			body:         `{"action":"accept"}`,
			service:      &chainServiceStub{processDecErr: repoDTO.ErrChainNotFound},
			wantStatus:   http.StatusNotFound,
		},
		{
			name:         "user not in chain step (forbidden)",
			chainIDParam: testChainID,
			userIDHeader: testUserID.String(),
			body:         `{"action":"accept"}`,
			service:      &chainServiceStub{processDecErr: repoDTO.ErrStepNotFound},
			wantStatus:   http.StatusForbidden,
		},
		{
			name:         "invalid decision action or state",
			chainIDParam: testChainID,
			userIDHeader: testUserID.String(),
			body:         `{"action":"invalid_action"}`,
			service:      &chainServiceStub{processDecErr: repoDTO.ErrInvalidAction},
			wantStatus:   http.StatusBadRequest,
		},
	}
}

func TestProcessDecisionHandler(t *testing.T) {
	testUserID := uuid.New()
	testChainID := uuid.New().String()
	tests := getProcessDecisionTestCases(testUserID, testChainID)

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			gin.SetMode(gin.TestMode)
			handler := transport.NewChainHandler(test.service)

			router := gin.New()
			api := router.Group("/api/v1")
			api.Use(middleware.DummyAuthMiddleware())
			{
				api.POST("/chains/:chain_id/decision", handler.ProcessDecisionHandler)
			}

			req := httptest.NewRequest(
				http.MethodPost,
				"/api/v1/chains/"+test.chainIDParam+"/decision",
				bytes.NewBufferString(test.body),
			)
			req.Header.Set("Content-Type", "application/json")
			if test.userIDHeader != "" {
				req.Header.Set("X-User-ID", test.userIDHeader)
			}

			w := httptest.NewRecorder()
			router.ServeHTTP(w, req)

			if w.Code != test.wantStatus {
				t.Fatalf("expected status %d, got %d: %s", test.wantStatus, w.Code, w.Body.String())
			}

			if test.wantStatus == http.StatusOK {
				if test.service.lastUserID != testUserID {
					t.Errorf("expected userID %s in service call, got %s", testUserID, test.service.lastUserID)
				}
				if test.service.lastChainID != testChainID {
					t.Errorf("expected chainID %s in service call, got %s", testChainID, test.service.lastChainID)
				}
			}
		})
	}
}
