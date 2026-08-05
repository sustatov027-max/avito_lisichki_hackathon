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
	params, err := buildCreateOfferParams(req)
	if err != nil {
		return nil, fmt.Errorf("build offer params: %w", err)
	}

	requestHash, err := hashRequest(req)
	if err != nil {
		return nil, fmt.Errorf("hash request for idempotency: %w", err)
	}

	res, err := s.repo.CreateOffer(ctx, params, repoDTO.IdempotencyParams{
		Key:         idempotencyKey,
		RequestHash: requestHash,
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

func buildCreateOfferParams(req dto.PostExchangeRequest) (repoDTO.CreateOfferParams, error) {
	userID, err := uuid.Parse(req.UserID)
	if err != nil {
		return repoDTO.CreateOfferParams{}, fmt.Errorf("invalid user_id UUID: %w", err)
	}

	offeredCategoryID, err := uuid.Parse(req.OfferedItem.CategoryID)
	if err != nil {
		return repoDTO.CreateOfferParams{}, fmt.Errorf("invalid offered_item.category_id UUID: %w", err)
	}

	var wantedCategoryID uuid.UUID
	if req.WantedItem.CategoryID != "" {
		wantedCategoryID, err = uuid.Parse(req.WantedItem.CategoryID)
		if err != nil {
			return repoDTO.CreateOfferParams{}, fmt.Errorf("invalid wanted_item.category_id UUID: %w", err)
		}
	}

	offeredAttrJSON, err := json.Marshal(req.OfferedItem.Attributes)
	if err != nil {
		return repoDTO.CreateOfferParams{}, fmt.Errorf("marshal offered attributes: %w", err)
	}

	wantedAttrJSON, err := json.Marshal(req.WantedItem.Attributes)
	if err != nil {
		return repoDTO.CreateOfferParams{}, fmt.Errorf("marshal wanted attributes: %w", err)
	}

	var minPrice, maxPrice *float64
	if req.WantedItem.MinPrice != nil {
		val := float64(*req.WantedItem.MinPrice)
		minPrice = &val
	}
	if req.WantedItem.MaxPrice != nil {
		val := float64(*req.WantedItem.MaxPrice)
		maxPrice = &val
	}

	return repoDTO.CreateOfferParams{
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
			MinPrice:      minPrice,
			MaxPrice:      maxPrice,
			AllowDelivery: req.DeliveryEnabled,
			Attributes:    wantedAttrJSON,
		},
	}, nil
}

func hashRequest(v interface{}) (string, error) {
	requestPayload, err := json.Marshal(v)
	if err != nil {
		return "", err
	}
	return fmt.Sprintf("%x", sha256.Sum256(requestPayload)), nil
}
