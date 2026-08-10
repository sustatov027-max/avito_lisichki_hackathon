package exchange

import (
	"time"

	"github.com/google/uuid"
)

type Item struct {
	ID              uuid.UUID
	Title           string
	CategoryID      uuid.UUID
	EstimatedPrice  float64
	CityName        string
	DeliveryEnabled bool
	Photos          []string
	Status          string
	CreatedAt       time.Time
	DesiredItem     DesiredItem
	Chain           *ChainInfo
}

type DesiredItem struct {
	ID            uuid.UUID
	TitlePattern  *string
	CategoryID    uuid.UUID
	MinPrice      *float64
	MaxPrice      *float64
	AllowDelivery bool
}

type ChainInfo struct {
	ID                 uuid.UUID
	Status             string
	Length             int
	UserActionRequired bool
}
