package dto

import "time"

type GetMyOffersResponse struct {
	Items []OfferResponse `json:"items"`
	Total int             `json:"total" example:"1"`
}

type OfferResponse struct {
	OfferedItemID   string              `json:"offered_item_id" example:"offer-1"`
	Title           string              `json:"title" example:"Vintage Camera"`
	CategoryID      string              `json:"category_id" example:"electronics-vintage"`
	EstimatedPrice  float64             `json:"estimated_price" example:"2500.0"`
	CityName        string              `json:"city_name" example:"Moscow"`
	DeliveryEnabled bool                `json:"delivery_enabled" example:"false"`
	Photos          []string            `json:"photos" example:"[\"https://example.com/photos/1.jpg\"]"`
	ItemStatus      string              `json:"item_status" example:"active"`
	CreatedAt       time.Time           `json:"created_at" example:"2026-08-09T12:00:00Z"`
	DesiredItem     DesiredItemResponse `json:"desired_item"`
	ChainInfo       ChainInfoResponse   `json:"chain_info"`
}

type DesiredItemResponse struct {
	ID            string   `json:"id" example:"desired-1"`
	TitlePattern  *string  `json:"title_pattern" example:"camera"`
	CategoryID    string   `json:"category_id" example:"electronics"`
	MinPrice      *float64 `json:"min_price" example:"1000.0"`
	MaxPrice      *float64 `json:"max_price" example:"3000.0"`
	AllowDelivery bool     `json:"allow_delivery" example:"true"`
}

type ChainInfoResponse struct {
	HasChain           bool    `json:"has_chain" example:"true"`
	ChainID            *string `json:"chain_id" example:"123e4567-e89b-12d3-a456-426614174000"`
	Status             string  `json:"status" example:"pending"`
	ChainLength        *int    `json:"chain_length" example:"2"`
	UserActionRequired bool    `json:"user_action_required" example:"true"`
}
