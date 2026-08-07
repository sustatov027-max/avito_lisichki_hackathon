package service

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/offer"
	"github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/offer/dto"
)

func (s *OfferService) GetMyOffers(ctx context.Context, userID uuid.UUID) (*dto.GetMyOffersResponse, error) {
	items, err := s.repository.GetByUserID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("get user offers: %w", err)
	}

	responseItems := make([]dto.OfferResponse, 0, len(items))
	for index := range items {
		responseItems = append(responseItems, mapOffer(items[index]))
	}

	return &dto.GetMyOffersResponse{Items: responseItems, Total: len(responseItems)}, nil
}

func mapOffer(item offer.Item) dto.OfferResponse {
	chainInfo := dto.ChainInfoResponse{Status: "searching"}
	if item.Chain != nil {
		chainID := item.Chain.ID.String()
		chainLength := item.Chain.Length
		chainInfo = dto.ChainInfoResponse{
			HasChain: true, ChainID: &chainID, Status: item.Chain.Status,
			ChainLength: &chainLength, UserActionRequired: item.Chain.UserActionRequired,
		}
	}

	return dto.OfferResponse{
		OfferedItemID: item.ID.String(), Title: item.Title, CategoryID: item.CategoryID.String(),
		EstimatedPrice: item.EstimatedPrice, CityName: item.CityName, DeliveryEnabled: item.DeliveryEnabled,
		Photos: item.Photos, ItemStatus: item.Status, CreatedAt: item.CreatedAt,
		DesiredItem: dto.DesiredItemResponse{
			ID: item.DesiredItem.ID.String(), TitlePattern: item.DesiredItem.TitlePattern,
			CategoryID: item.DesiredItem.CategoryID.String(), MinPrice: item.DesiredItem.MinPrice,
			MaxPrice: item.DesiredItem.MaxPrice, AllowDelivery: item.DesiredItem.AllowDelivery,
		},
		ChainInfo: chainInfo,
	}
}
