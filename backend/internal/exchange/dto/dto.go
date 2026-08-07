package dto

import "time"

type PostExchangeRequest struct {
	UserID          string             `json:"user_id" binding:"required"`
	CityName        string             `json:"city_name" binding:"required"`
	DeliveryEnabled bool               `json:"delivery_enabled"`
	OfferedItem     OfferedItemRequest `json:"offered_item" binding:"required"`
	WantedItem      WantedItemRequest  `json:"wanted_item" binding:"required"`
}

type OfferedItemRequest struct {
	Title          string      `json:"title" binding:"required"`
	Description    string      `json:"description"`
	CategoryID     string      `json:"category_id" binding:"required"`
	EstimatedPrice int         `json:"estimated_price"`
	Photos         []string    `json:"photos"`
	Attributes     []Attribute `json:"attributes,omitempty"`
}

type WantedItemRequest struct {
	TitleQuery string      `json:"title_query,omitempty"`
	CategoryID string      `json:"category_id,omitempty"`
	Attributes []Attribute `json:"attributes,omitempty"`
	MinPrice   *int        `json:"min_price,omitempty"`
	MaxPrice   *int        `json:"max_price,omitempty"`
}

type Attribute struct {
	AttributeID string      `json:"attribute_id" binding:"required"`
	Value       interface{} `json:"value" binding:"required"` // Может быть строкой, числом, объектом {"min": X, "max": Y} или массивом
}

type PostExchangeResponse struct {
	ID        string    `json:"id"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"created_at"`
	Replayed  bool      `json:"-"`
}
