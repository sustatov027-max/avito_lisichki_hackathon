package service_test

import (
	"context"
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/exchange/dto"
	repoDTO "github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/exchange/repository"
	"github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/exchange/service"
)

type MockTradeOfferRepository struct {
	mock.Mock
}

func (m *MockTradeOfferRepository) CreateOffer(ctx context.Context, params repoDTO.CreateOfferParams, idempotency repoDTO.IdempotencyParams) (*repoDTO.CreateOfferResult, error) {
	args := m.Called(ctx, params, idempotency)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*repoDTO.CreateOfferResult), args.Error(1)
}

func calculateExpectedHash(v interface{}) string {
	payload, _ := json.Marshal(v)
	return fmt.Sprintf("%x", sha256.Sum256(payload))
}

func newValidServiceRequest(userID, offerCatID, wantedCatID uuid.UUID) dto.PostExchangeRequest {
	minPriceVal := 1000
	maxPriceVal := 5000

	return dto.PostExchangeRequest{
		UserID:          userID.String(),
		CityName:        "Москва",
		DeliveryEnabled: true,
		OfferedItem: dto.OfferedItemRequest{
			Title:          "Комиксы Marvel",
			Description:    "10 томов",
			CategoryID:     offerCatID.String(),
			EstimatedPrice: 12000,
			Photos:         []string{"photo1.jpg"},
			Attributes:     []dto.Attribute{{AttributeID: "publisher", Value: "Marvel"}},
		},
		WantedItem: dto.WantedItemRequest{
			TitleQuery: "Смартфон",
			CategoryID: wantedCatID.String(),
			MinPrice:   &minPriceVal,
			MaxPrice:   &maxPriceVal,
			Attributes: []dto.Attribute{{AttributeID: "brand", Value: "Xiaomi"}},
		},
	}
}

func TestPostExchange_Success(t *testing.T) {
	validUserID := uuid.New()
	validOfferCatID := uuid.New()
	validWantedCatID := uuid.New()
	createdItemID := uuid.New()
	now := time.Now()

	req := newValidServiceRequest(validUserID, validOfferCatID, validWantedCatID)

	t.Run("Успешное создание объявления", func(t *testing.T) {
		mockRepo := new(MockTradeOfferRepository)
		mockRepo.On("CreateOffer", mock.Anything, mock.Anything, repoDTO.IdempotencyParams{
			Key:         "key-123",
			RequestHash: calculateExpectedHash(req),
		}).Return(&repoDTO.CreateOfferResult{
			OfferedItemID: createdItemID,
			Status:        "active",
			CreatedAt:     now,
			Replayed:      false,
		}, nil)

		srv := service.NewExchangeService(mockRepo)
		resp, err := srv.PostExchange(context.Background(), "key-123", req)

		assert.NoError(t, err)
		assert.Equal(t, createdItemID.String(), resp.ID)
		assert.False(t, resp.Replayed)
		mockRepo.AssertExpectations(t)
	})

	t.Run("Успешный повтор идемпотентного запроса", func(t *testing.T) {
		mockRepo := new(MockTradeOfferRepository)
		mockRepo.On("CreateOffer", mock.Anything, mock.Anything, mock.Anything).
			Return(&repoDTO.CreateOfferResult{
				OfferedItemID: createdItemID,
				Status:        "active",
				CreatedAt:     now,
				Replayed:      true,
			}, nil)

		srv := service.NewExchangeService(mockRepo)
		resp, err := srv.PostExchange(context.Background(), "key-123", req)

		assert.NoError(t, err)
		assert.True(t, resp.Replayed)
		mockRepo.AssertExpectations(t)
	})
}

func TestPostExchange_ValidationErrors(t *testing.T) {
	validUserID := uuid.New()
	validOfferCatID := uuid.New()
	validWantedCatID := uuid.New()

	baseReq := newValidServiceRequest(validUserID, validOfferCatID, validWantedCatID)

	tests := []struct {
		name        string
		reqModifier func(r dto.PostExchangeRequest) dto.PostExchangeRequest
		errContains string
	}{
		{
			name: "Невалидный user_id UUID",
			reqModifier: func(r dto.PostExchangeRequest) dto.PostExchangeRequest {
				r.UserID = "invalid-uuid"
				return r
			},
			errContains: "invalid user_id UUID",
		},
		{
			name: "Невалидный offered_item.category_id UUID",
			reqModifier: func(r dto.PostExchangeRequest) dto.PostExchangeRequest {
				r.OfferedItem.CategoryID = "not-a-uuid"
				return r
			},
			errContains: "invalid offered_item.category_id UUID",
		},
		{
			name: "Невалидный wanted_item.category_id UUID",
			reqModifier: func(r dto.PostExchangeRequest) dto.PostExchangeRequest {
				r.WantedItem.CategoryID = "bad-uuid"
				return r
			},
			errContains: "invalid wanted_item.category_id UUID",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := new(MockTradeOfferRepository)
			srv := service.NewExchangeService(mockRepo)

			_, err := srv.PostExchange(context.Background(), "key-123", tt.reqModifier(baseReq))

			assert.Error(t, err)
			assert.Contains(t, err.Error(), tt.errContains)
		})
	}
}

func TestPostExchange_RepoErrors(t *testing.T) {
	validUserID := uuid.New()
	validOfferCatID := uuid.New()
	validWantedCatID := uuid.New()
	req := newValidServiceRequest(validUserID, validOfferCatID, validWantedCatID)

	t.Run("Ошибка репозитория", func(t *testing.T) {
		mockRepo := new(MockTradeOfferRepository)
		mockRepo.On("CreateOffer", mock.Anything, mock.Anything, mock.Anything).
			Return(nil, repoDTO.ErrIdempotencyConflict)

		srv := service.NewExchangeService(mockRepo)
		_, err := srv.PostExchange(context.Background(), "key-conflict", req)

		assert.ErrorIs(t, err, repoDTO.ErrIdempotencyConflict)
		mockRepo.AssertExpectations(t)
	})
}
