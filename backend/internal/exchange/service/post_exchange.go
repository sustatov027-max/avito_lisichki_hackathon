package service

import (
	"context"
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/google/uuid"
	"github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/exchange/dto"
	repoDTO "github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/exchange/repository"
)

func (s *ExchangeService) PostExchange(
	ctx context.Context,
	userID uuid.UUID,
	idempotencyKey string,
	req dto.PostExchangeRequest,
) (*dto.PostExchangeResponse, error) {
	if err := validatePostExchangeRequest(req); err != nil {
		return nil, err
	}

	params, err := buildCreateOfferParams(userID, req)
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

func validatePostExchangeRequest(req dto.PostExchangeRequest) error {
	if err := validateOfferedItem(req.CityName, req.OfferedItem); err != nil {
		return err
	}
	if err := validateWantedItem(req.WantedItem); err != nil {
		return err
	}
	if err := validateAttributes(req.OfferedItem.Attributes, req.WantedItem.Attributes); err != nil {
		return err
	}
	return nil
}

func validateOfferedItem(cityName string, item dto.OfferedItem) error {
	if strings.TrimSpace(cityName) == "" {
		return fmt.Errorf("%w: city_name is required", repoDTO.ErrInvalidRequest)
	}
	if len(cityName) > 100 {
		return fmt.Errorf("%w: city_name must be at most 100 characters", repoDTO.ErrInvalidRequest)
	}
	if strings.TrimSpace(item.Title) == "" {
		return fmt.Errorf("%w: offered_item.title is required", repoDTO.ErrInvalidRequest)
	}
	if len(item.Title) > 255 {
		return fmt.Errorf("%w: offered_item.title must be at most 255 characters", repoDTO.ErrInvalidRequest)
	}
	if len(item.Description) > 1000 {
		return fmt.Errorf("%w: offered_item.description must be at most 1000 characters", repoDTO.ErrInvalidRequest)
	}
	if item.EstimatedPrice < 0 {
		return fmt.Errorf("%w: offered_item.estimated_price must be non-negative", repoDTO.ErrInvalidRequest)
	}
	return validatePhotos(item.Photos)
}

func validatePhotos(photos []string) error {
	if len(photos) > 20 {
		return fmt.Errorf("%w: offered_item.photos must contain at most 20 entries", repoDTO.ErrInvalidRequest)
	}
	for i, photo := range photos {
		if strings.TrimSpace(photo) == "" {
			return fmt.Errorf("%w: offered_item.photos[%d] must not be empty", repoDTO.ErrInvalidRequest, i)
		}
		if len(photo) > 1024 {
			return fmt.Errorf("%w: offered_item.photos[%d] must be at most 1024 characters", repoDTO.ErrInvalidRequest, i)
		}
	}
	return nil
}

func validateWantedItem(item dto.WantedItem) error {
	if len(item.TitleQuery) > 255 {
		return fmt.Errorf("%w: wanted_item.title_query must be at most 255 characters", repoDTO.ErrInvalidRequest)
	}
	if item.MinPrice != nil && *item.MinPrice < 0 {
		return fmt.Errorf("%w: wanted_item.min_price must be non-negative", repoDTO.ErrInvalidRequest)
	}
	if item.MaxPrice != nil && *item.MaxPrice < 0 {
		return fmt.Errorf("%w: wanted_item.max_price must be non-negative", repoDTO.ErrInvalidRequest)
	}
	if item.MinPrice != nil && item.MaxPrice != nil && *item.MinPrice > *item.MaxPrice {
		return fmt.Errorf("%w: wanted_item.min_price must be less than or equal to wanted_item.max_price", repoDTO.ErrInvalidRequest)
	}
	return nil
}

func validateAttributes(offered, wanted []dto.Attribute) error {
	if len(offered)+len(wanted) > 40 {
		return fmt.Errorf("%w: total number of attributes must be at most 40", repoDTO.ErrInvalidRequest)
	}

	for _, attr := range append(offered, wanted...) {
		if err := validateSingleAttribute(attr); err != nil {
			return err
		}
	}
	return nil
}

func validateSingleAttribute(attr dto.Attribute) error {
	if strings.TrimSpace(attr.AttributeID) == "" {
		return fmt.Errorf("%w: attribute_id is required", repoDTO.ErrInvalidRequest)
	}
	if _, err := uuid.Parse(attr.AttributeID); err != nil {
		return fmt.Errorf("%w: invalid attribute_id UUID: %w", repoDTO.ErrInvalidRequest, err)
	}
	if len(attr.Values) > 20 {
		return fmt.Errorf("%w: attribute values must contain at most 20 entries", repoDTO.ErrInvalidRequest)
	}
	for _, value := range attr.Values {
		if strings.TrimSpace(value) == "" {
			return fmt.Errorf("%w: attribute values must not contain empty strings", repoDTO.ErrInvalidRequest)
		}
		if len(value) > 256 {
			return fmt.Errorf("%w: attribute values must be at most 256 characters", repoDTO.ErrInvalidRequest)
		}
	}
	if attr.Value != nil && len(strings.TrimSpace(*attr.Value)) == 0 {
		return fmt.Errorf("%w: attribute value must not be empty", repoDTO.ErrInvalidRequest)
	}
	return nil
}

func buildCreateOfferParams(userID uuid.UUID, req dto.PostExchangeRequest) (repoDTO.CreateOfferParams, error) {
	offeredCategoryID, err := uuid.Parse(req.OfferedItem.CategoryID)
	if err != nil {
		return repoDTO.CreateOfferParams{}, fmt.Errorf("%w: invalid offered_item.category_id UUID: %w", repoDTO.ErrInvalidRequest, err)
	}

	var wantedCategoryID uuid.UUID
	if req.WantedItem.CategoryID != "" {
		wantedCategoryID, err = uuid.Parse(req.WantedItem.CategoryID)
		if err != nil {
			return repoDTO.CreateOfferParams{}, fmt.Errorf("%w: invalid wanted_item.category_id UUID: %w", repoDTO.ErrInvalidRequest, err)
		}
	}

	// Приводим атрибуты к каноническому формату, в котором их ожидает SQL-функция items_match
	offeredAttrJSON, err := json.Marshal(dto.NormalizeAttributes(req.OfferedItem.Attributes))
	if err != nil {
		return repoDTO.CreateOfferParams{}, fmt.Errorf("marshal offered attributes: %w", err)
	}

	wantedAttrJSON, err := json.Marshal(dto.NormalizeAttributes(req.WantedItem.Attributes))
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
