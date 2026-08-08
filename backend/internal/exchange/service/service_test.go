package service

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/exchange"
	"github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/exchange/dto"
	repoDTO "github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/exchange/repository"
)

type MockTradeOfferRepository struct {
	mock.Mock
}

func (m *MockTradeOfferRepository) CreateOffer(ctx context.Context, params repoDTO.CreateOfferParams, idempotency repoDTO.IdempotencyParams) (*repoDTO.CreateOfferResult, error) {
	args := m.Called(ctx, params, idempotency)
	if res := args.Get(0); res != nil {
		return res.(*repoDTO.CreateOfferResult), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockTradeOfferRepository) GetByUserID(ctx context.Context, userID uuid.UUID) ([]exchange.Item, error) {
	args := m.Called(ctx, userID)
	if res := args.Get(0); res != nil {
		return res.([]exchange.Item), args.Error(1)
	}
	return nil, args.Error(1)
}

// -----------------------------------------------------------------------------
// PostExchange Tests & Case Generator
// -----------------------------------------------------------------------------

type postExchangeTestCase struct {
	name        string
	userID      uuid.UUID
	key         string
	req         dto.PostExchangeRequest
	mockSetup   func(repo *MockTradeOfferRepository)
	wantErr     bool
	errContains string
}

func getPostExchangeCases() []postExchangeTestCase {
	validUserID := uuid.New()
	offeredCatID := uuid.New()
	wantedCatID := uuid.New()
	minPrice := 100
	maxPrice := 200

	validReq := dto.PostExchangeRequest{
		CityName:        "Москва",
		DeliveryEnabled: true,
		OfferedItem: dto.OfferedItem{
			Title:          "Ноутбук",
			CategoryID:     offeredCatID.String(),
			EstimatedPrice: 50000,
		},
		WantedItem: dto.WantedItem{
			TitleQuery: "Телефон",
			CategoryID: wantedCatID.String(),
			MinPrice:   &minPrice,
			MaxPrice:   &maxPrice,
		},
	}

	return []postExchangeTestCase{
		{
			name:        "Error - Invalid Offered Category UUID",
			userID:      validUserID,
			key:         "key-1",
			req:         dto.PostExchangeRequest{OfferedItem: dto.OfferedItem{CategoryID: "invalid-uuid"}},
			wantErr:     true,
			errContains: "invalid offered_item.category_id UUID",
		},
		{
			name:   "Error - Invalid Wanted Category UUID",
			userID: validUserID,
			key:    "key-1",
			req: dto.PostExchangeRequest{
				OfferedItem: dto.OfferedItem{CategoryID: offeredCatID.String()},
				WantedItem:  dto.WantedItem{CategoryID: "invalid-uuid"},
			},
			wantErr:     true,
			errContains: "invalid wanted_item.category_id UUID",
		},
		{
			name:   "Error - Repository CreateOffer Failed",
			userID: validUserID,
			key:    "key-1",
			req:    validReq,
			mockSetup: func(repo *MockTradeOfferRepository) {
				repo.On("CreateOffer", mock.Anything, mock.Anything, mock.Anything).
					Return(nil, errors.New("db error"))
			},
			wantErr:     true,
			errContains: "db error",
		},
		{
			name:   "Success - Offer Created",
			userID: validUserID,
			key:    "key-1",
			req:    validReq,
			mockSetup: func(repo *MockTradeOfferRepository) {
				repo.On("CreateOffer", mock.Anything, mock.Anything, mock.Anything).
					Return(&repoDTO.CreateOfferResult{
						OfferedItemID: offeredCatID,
						Status:        "active",
						CreatedAt:     time.Now(),
						Replayed:      false,
					}, nil)
			},
			wantErr: false,
		},
	}
}

func TestPostExchange(t *testing.T) {
	for _, tc := range getPostExchangeCases() {
		t.Run(tc.name, func(t *testing.T) {
			mockRepo := new(MockTradeOfferRepository)
			if tc.mockSetup != nil {
				tc.mockSetup(mockRepo)
			}

			svc := NewExchangeService(mockRepo)
			res, err := svc.PostExchange(context.Background(), tc.userID, tc.key, tc.req)

			if tc.wantErr {
				assert.Error(t, err)
				if tc.errContains != "" {
					assert.Contains(t, err.Error(), tc.errContains)
				}
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, res)
			}
			mockRepo.AssertExpectations(t)
		})
	}
}

// -----------------------------------------------------------------------------
// GetMyOffers Tests
// -----------------------------------------------------------------------------

func TestGetMyOffers(t *testing.T) {
	userID := uuid.New()
	itemID := uuid.New()
	chainID := uuid.New()

	tests := []struct {
		name        string
		userID      uuid.UUID
		mockSetup   func(repo *MockTradeOfferRepository)
		wantErr     bool
		expectedLen int
	}{
		{
			name:   "Error - Repository Failure",
			userID: userID,
			mockSetup: func(repo *MockTradeOfferRepository) {
				repo.On("GetByUserID", mock.Anything, userID).
					Return(nil, errors.New("db connection lost"))
			},
			wantErr: true,
		},
		{
			name:   "Success - Empty Offers List",
			userID: userID,
			mockSetup: func(repo *MockTradeOfferRepository) {
				repo.On("GetByUserID", mock.Anything, userID).
					Return([]exchange.Item{}, nil)
			},
			wantErr:     false,
			expectedLen: 0,
		},
		{
			name:   "Success - Offers With Chain Info",
			userID: userID,
			mockSetup: func(repo *MockTradeOfferRepository) {
				repo.On("GetByUserID", mock.Anything, userID).
					Return([]exchange.Item{
						{
							ID:    itemID,
							Title: "Книга",
							Chain: &exchange.ChainInfo{
								ID:                 chainID,
								Length:             3,
								Status:             "matched",
								UserActionRequired: true,
							},
						},
					}, nil)
			},
			wantErr:     false,
			expectedLen: 1,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := new(MockTradeOfferRepository)
			if tt.mockSetup != nil {
				tt.mockSetup(mockRepo)
			}

			svc := NewExchangeService(mockRepo)
			res, err := svc.GetMyOffers(context.Background(), tt.userID)

			if tt.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, res)
				assert.Equal(t, tt.expectedLen, res.Total)
				assert.Equal(t, tt.expectedLen, len(res.Items))
			}
			mockRepo.AssertExpectations(t)
		})
	}
}

// -----------------------------------------------------------------------------
// Unit Tests for Hash Helper
// -----------------------------------------------------------------------------

func TestHashRequest(t *testing.T) {
	req := dto.PostExchangeRequest{CityName: "СПб"}

	hash1, err1 := hashRequest(req)
	assert.NoError(t, err1)
	assert.NotEmpty(t, hash1)

	hash2, err2 := hashRequest(req)
	assert.NoError(t, err2)
	assert.Equal(t, hash1, hash2)
}