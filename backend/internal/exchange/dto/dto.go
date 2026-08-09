package dto

import "time"

type PostExchangeRequest struct {
	CityName        string      `json:"city_name" binding:"required" example:"Moscow"`
	DeliveryEnabled bool        `json:"delivery_enabled" example:"false"`
	OfferedItem     OfferedItem `json:"offered_item" binding:"required"`
	WantedItem      WantedItem  `json:"wanted_item" binding:"required"`
}

type OfferedItem struct {
	Title          string      `json:"title" binding:"required" example:"Vintage Camera"`
	Description    string      `json:"description" example:"Old film camera in working condition"`
	CategoryID     string      `json:"category_id" binding:"required" example:"electronics-vintage"`
	EstimatedPrice int         `json:"estimated_price" example:"2500"`
	Photos         []string    `json:"photos" example:"[\"https://example.com/photos/1.jpg\"]"`
	Attributes     []Attribute `json:"attributes,omitempty"`
}

type WantedItem struct {
	TitleQuery string      `json:"title_query,omitempty" example:"camera"`
	CategoryID string      `json:"category_id,omitempty" example:"electronics"`
	Attributes []Attribute `json:"attributes,omitempty"`
	MinPrice   *int        `json:"min_price,omitempty" example:"1000"`
	MaxPrice   *int        `json:"max_price,omitempty" example:"3000"`
}

type Attribute struct {
	AttributeID string   `json:"attribute_id" binding:"required" example:"color"`
	Value       *string  `json:"value,omitempty" example:"red"`     // Добавлено для одиночных значений ("value": "like_new")
	Values      []string `json:"values,omitempty" example:"[\"white\"]"`    // Для массивов ("values": ["white"])
	MinValue    *int     `json:"min_value,omitempty" example:"65"` // Для диапазонных фильтров ("min_value": 65)
	MaxValue    *int     `json:"max_value,omitempty" example:"345"` // Для диапазонных фильтров ("max_value": 345)
}

type PostExchangeResponse struct {
	ID        string    `json:"id" example:"exchange-uuid-1"`
	Status    string    `json:"status" example:"created"`
	CreatedAt time.Time `json:"created_at" example:"2026-08-09T12:00:00Z"`
	Replayed  bool      `json:"-"`
}
