package dto

import "time"

type PostExchangeRequest struct {
	UserID          string      `json:"user_id" binding:"required"`
	CityName        string      `json:"city_name" binding:"required"`
	DeliveryEnabled bool        `json:"delivery_enabled"`
	OfferedItem     OfferedItem `json:"offered_item" binding:"required"`
	WantedItem      WantedItem  `json:"wanted_item" binding:"required"`
}

type OfferedItem struct {
	Title          string      `json:"title" binding:"required"`
	Description    string      `json:"description"`
	CategoryID     string      `json:"category_id" binding:"required"`
	EstimatedPrice int         `json:"estimated_price"`
	Photos         []string    `json:"photos"`
	Attributes     []Attribute `json:"attributes,omitempty"`
}

type WantedItem struct {
	TitleQuery string      `json:"title_query,omitempty"`
	CategoryID string      `json:"category_id,omitempty"`
	Attributes []Attribute `json:"attributes,omitempty"`
	MinPrice   *int        `json:"min_price,omitempty"`
	MaxPrice   *int        `json:"max_price,omitempty"`
}

type Attribute struct {
	AttributeID string   `json:"attribute_id" binding:"required"`
	Value       *string  `json:"value,omitempty"`                 // Добавлено для одиночных значений ("value": "like_new")
	Values      []string `json:"values,omitempty"`                // Для массивов ("values": ["white"])
	MinValue    *int     `json:"min_value,omitempty"`             // Для диапазонных фильтров ("min_value": 65)
	MaxValue    *int     `json:"max_value,omitempty"`             // Для диапазонных фильтров ("max_value": 345)
}

type PostExchangeResponse struct {
	ID        string    `json:"id"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"created_at"`
}