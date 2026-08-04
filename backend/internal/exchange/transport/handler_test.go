package transport_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/exchange/dto"
	"github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/exchange/repository/stub"
	"github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/exchange/service"
	"github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/exchange/transport"
)

const validOffer = `{
  "user_id":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  "city_name":"Москва",
  "delivery_enabled":true,
  "offered_item":{
    "title":"Велосипед",
    "category_id":"bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    "estimated_price":10000
  },
  "wanted_item":{"title_query":"Самокат"}
}`

func TestPostExchangeHandlerIdempotentReplay(t *testing.T) {
	router := newTestRouter()
	first := performRequest(router, "offer-request-1", validOffer)
	second := performRequest(router, "offer-request-1", validOffer)

	if first.Code != http.StatusCreated || second.Code != http.StatusCreated {
		t.Fatalf("expected both statuses 201, got %d and %d", first.Code, second.Code)
	}
	if second.Header().Get("Idempotency-Replayed") != "true" {
		t.Fatal("expected replay response header")
	}

	var firstResponse, secondResponse dto.PostExchangeResponse
	if err := json.Unmarshal(first.Body.Bytes(), &firstResponse); err != nil {
		t.Fatalf("decode first response: %v", err)
	}
	if err := json.Unmarshal(second.Body.Bytes(), &secondResponse); err != nil {
		t.Fatalf("decode second response: %v", err)
	}
	if firstResponse.ID != secondResponse.ID || !firstResponse.CreatedAt.Equal(secondResponse.CreatedAt) {
		t.Fatalf("replay returned a different resource: %#v != %#v", firstResponse, secondResponse)
	}
}

func TestPostExchangeHandlerRejectsKeyReuseWithDifferentBody(t *testing.T) {
	router := newTestRouter()
	first := performRequest(router, "offer-request-2", validOffer)
	changed := bytes.ReplaceAll([]byte(validOffer), []byte("Москва"), []byte("Казань"))
	second := performRequest(router, "offer-request-2", string(changed))

	if first.Code != http.StatusCreated {
		t.Fatalf("expected first status 201, got %d", first.Code)
	}
	if second.Code != http.StatusConflict {
		t.Fatalf("expected conflict status 409, got %d: %s", second.Code, second.Body.String())
	}
}

func TestPostExchangeHandlerRejectsInvalidIdempotencyKey(t *testing.T) {
	router := newTestRouter()
	response := performRequest(router, "contains whitespace", validOffer)

	if response.Code != http.StatusBadRequest {
		t.Fatalf("expected status 400, got %d", response.Code)
	}
}

func newTestRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	repository := stub.NewTradeOfferStubRepository()
	exchangeService := service.NewExchangeService(repository)
	handler := transport.NewExchangeHandler(exchangeService)
	router := gin.New()
	router.POST("/api/v1/offers", handler.PostExchangeHandler)

	return router
}

func performRequest(router http.Handler, key, body string) *httptest.ResponseRecorder {
	req := httptest.NewRequest(http.MethodPost, "/api/v1/offers", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Idempotency-Key", key)
	response := httptest.NewRecorder()
	router.ServeHTTP(response, req)

	return response
}
