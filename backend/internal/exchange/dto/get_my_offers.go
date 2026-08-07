package dto

import "time"

type GetMyOffersResponse struct {
	Items []OfferResponse `json:"items"`
	Total int             `json:"total"`
}

type OfferResponse struct {
	OfferedItemID   string              `json:"offered_item_id"`
	Title           string              `json:"title"`
	CategoryID      string              `json:"category_id"`
	EstimatedPrice  float64             `json:"estimated_price"`
	CityName        string              `json:"city_name"`
	DeliveryEnabled bool                `json:"delivery_enabled"`
	Photos          []string            `json:"photos"`
	ItemStatus      string              `json:"item_status"`
	CreatedAt       time.Time           `json:"created_at"`
	DesiredItem     DesiredItemResponse `json:"desired_item"`
	ChainInfo       ChainInfoResponse   `json:"chain_info"`
}

type DesiredItemResponse struct {
	ID            string   `json:"id"`
	TitlePattern  *string  `json:"title_pattern"`
	CategoryID    string   `json:"category_id"`
	MinPrice      *float64 `json:"min_price"`
	MaxPrice      *float64 `json:"max_price"`
	AllowDelivery bool     `json:"allow_delivery"`
}

type ChainInfoResponse struct {
	HasChain           bool    `json:"has_chain"`
	ChainID            *string `json:"chain_id"`
	Status             string  `json:"status"`
	ChainLength        *int    `json:"chain_length"`
	UserActionRequired bool    `json:"user_action_required"`
}
