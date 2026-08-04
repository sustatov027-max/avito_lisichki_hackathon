package service

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/google/uuid"
	"github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/exchange/dto"
	repoDTO "github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/exchange/repository"
)

type TradeOfferRepository interface {
	CreateOffer(ctx context.Context, params repoDTO.CreateOfferParams) (*repoDTO.CreateOfferResult, error)
}

type ExchangeService struct {
	repo TradeOfferRepository
}

func NewExchangeService(repo TradeOfferRepository) *ExchangeService {
	return &ExchangeService{
		repo: repo,
	}
}

func (s *ExchangeService) PostExchange(ctx context.Context, req dto.PostExchangeRequest) (*dto.PostExchangeResponse, error) {
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

	var minPrice, maxPrice *float64
	if req.WantedItem.MinPrice != nil {
		val := float64(*req.WantedItem.MinPrice)
		minPrice = &val
	}
	if req.WantedItem.MaxPrice != nil {
		val := float64(*req.WantedItem.MaxPrice)
		maxPrice = &val
	}

	params := repoDTO.CreateOfferParams{
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
	}

	res, err := s.repo.CreateOffer(ctx, params)
	if err != nil {
		return nil, fmt.Errorf("repository create offer: %w", err)
	}

	return &dto.PostExchangeResponse{
		ID:        res.OfferedItemID.String(),
		Status:    res.Status,
		CreatedAt: res.CreatedAt,
	}, nil
}
