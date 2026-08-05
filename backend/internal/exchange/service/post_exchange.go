package service

import (
	"context"
	"crypto/sha256"
	"encoding/json"
	"fmt"

	"github.com/google/uuid"
	"github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/exchange/dto"
	repoDTO "github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/exchange/repository"
)

type TradeOfferRepository interface {
	CreateOffer(ctx context.Context, params repoDTO.CreateOfferParams, idempotency repoDTO.IdempotencyParams) (*repoDTO.CreateOfferResult, error)
}

type ExchangeService struct {
	repo TradeOfferRepository
}

func NewExchangeService(repo TradeOfferRepository) *ExchangeService {
	return &ExchangeService{
		repo: repo,
	}
}

func (s *ExchangeService) PostExchange(ctx context.Context, idempotencyKey string, req dto.PostExchangeRequest) (*dto.PostExchangeResponse, error) {
	params, err := parseOfferParams(req)
	if err != nil {
		return nil, err
	}

	reqHash, err := calculateRequestHash(req)
	if err != nil {
		return nil, err
	}

	res, err := s.repo.CreateOffer(ctx, *params, repoDTO.IdempotencyParams{
		Key:         idempotencyKey,
		RequestHash: reqHash,
	})
	if err != nil {
		return nil, err
	}

	return &dto.PostExchangeResponse{
		ID:        res.OfferedItemID.String(),
		Status:    res.Status,
		CreatedAt: res.CreatedAt,
		Replayed:  res.Replayed,
	}, nil
}

// --- Helper Functions ---

func parseOfferParams(req dto.PostExchangeRequest) (*repoDTO.CreateOfferParams, error) {
	userID, err := uuid.Parse(req.UserID)
	if err != nil {
		return nil, fmt.Errorf("invalid user_id UUID: %w", err)
	}

	offeredCategoryID, err := uuid.Parse(req.OfferedItem.CategoryID)
	if err != nil {
		return nil, fmt.Errorf("invalid offered_item.category_id UUID: %w", err)
	}

	var wantedCategoryID uuid.UUID
	if req.WantedItem.CategoryID != "" {
		wantedCategoryID, err = uuid.Parse(req.WantedItem.CategoryID)
		if err != nil {
			return nil, fmt.Errorf("invalid wanted_item.category_id UUID: %w", err)
		}
	}

	offeredAttrJSON, err := json.Marshal(req.OfferedItem.Attributes)
	if err != nil {
		return nil, fmt.Errorf("marshal offered attributes to JSON: %w", err)
	}

	wantedAttrJSON, err := json.Marshal(req.WantedItem.Attributes)
	if err != nil {
		return nil, fmt.Errorf("marshal wanted attributes to JSON: %w", err)
	}

	return &repoDTO.CreateOfferParams{
		UserID:          userID,
		CityName:        req.CityName,
		DeliveryEnabled: req.DeliveryEnabled,
		OfferedItem: repoDTO.OfferedItemParams{
			Title:          req.OfferedItem.Title,
			Description:    req.OfferedItem.Description,
			CategoryID:     offeredCategoryID,
			EstimatedPrice: float64(req.OfferedItem.EstimatedPrice),
			Photos:         req.OfferedItem.Photos,
			Attributes:     offeredAttrJSON,
			Status:         "active",
		},
		DesiredItem: repoDTO.DesiredItemParams{
			TitlePattern:  req.WantedItem.TitleQuery,
			CategoryID:    wantedCategoryID,
			MinPrice:      mapPricePtr(req.WantedItem.MinPrice),
			MaxPrice:      mapPricePtr(req.WantedItem.MaxPrice),
			AllowDelivery: req.DeliveryEnabled,
			Attributes:    wantedAttrJSON,
		},
	}, nil
}

func mapPricePtr(price *int) *float64 {
	if price == nil {
		return nil
	}
	val := float64(*price)
	return &val
}

func calculateRequestHash(req dto.PostExchangeRequest) (string, error) {
	requestPayload, err := json.Marshal(req)
	if err != nil {
		return "", fmt.Errorf("marshal request for idempotency: %w", err)
	}
	return fmt.Sprintf("%x", sha256.Sum256(requestPayload)), nil
}
