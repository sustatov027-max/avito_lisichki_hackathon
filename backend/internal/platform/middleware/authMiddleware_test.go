package middleware_test

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/platform/middleware"
)

type testContext struct {
	router      *gin.Engine
	extractedID *uuid.UUID
}

func setupTestRouter() *testContext {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	tc := &testContext{router: router}

	router.Use(middleware.DummyAuthMiddleware())
	router.GET("/test-endpoint", func(c *gin.Context) {
		if val, exists := c.Get("user_id"); exists {
			if id, ok := val.(uuid.UUID); ok {
				tc.extractedID = &id
			}
		}
		c.Status(http.StatusOK)
	})

	return tc
}

func executeMiddlewareRequest(router *gin.Engine, userIDHeader string) *httptest.ResponseRecorder {
	req, _ := http.NewRequest(http.MethodGet, "/test-endpoint", nil)
	if userIDHeader != "" {
		req.Header.Set("X-User-ID", userIDHeader)
	}

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	return w
}

func TestDummyAuthMiddleware_Success(t *testing.T) {
	tc := setupTestRouter()
	expectedUUID := uuid.New()

	w := executeMiddlewareRequest(tc.router, expectedUUID.String())

	assert.Equal(t, http.StatusOK, w.Code)
	assert.NotNil(t, tc.extractedID)
	assert.Equal(t, expectedUUID, *tc.extractedID)
}

func TestDummyAuthMiddleware_MissingHeader(t *testing.T) {
	tc := setupTestRouter()

	w := executeMiddlewareRequest(tc.router, "")

	assert.Equal(t, http.StatusUnauthorized, w.Code)
	assert.Nil(t, tc.extractedID)
	assert.Contains(t, w.Body.String(), "unauthorized: missing X-User-ID header")
}

func TestDummyAuthMiddleware_InvalidUUIDFormat(t *testing.T) {
	tests := []struct {
		name          string
		invalidHeader string
	}{
		{
			name:          "Не UUID строка",
			invalidHeader: "invalid-uuid-string",
		},
		{
			name:          "Обычное число",
			invalidHeader: "12345",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tc := setupTestRouter()

			w := executeMiddlewareRequest(tc.router, tt.invalidHeader)

			assert.Equal(t, http.StatusUnauthorized, w.Code)
			assert.Nil(t, tc.extractedID)
			assert.Contains(t, w.Body.String(), "invalid X-User-ID format, must be UUID")
		})
	}
}
