package dto

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

// CreateOfferParams содержит свалидированные и подготовленные данные для записи в БД
type CreateOfferParams struct {
	UserID          uuid.UUID
	CityName        string
	DeliveryEnabled bool
	OfferedItem     OfferedItemParams
	DesiredItem     DesiredItemParams
}

// OfferedItemParams параметры для вставки в таблицу offered_items
type OfferedItemParams struct {
	Title          string
	Description    string
	CategoryID     uuid.UUID
	EstimatedPrice float64
	Photos         []string
	Attributes     json.RawMessage // Подготовленный JSONB ([]byte) для колонки attributes
	Status         string          // Значение по умолчанию: "active"
}

// DesiredItemParams параметры для вставки в таблицу desired_items
type DesiredItemParams struct {
	TitlePattern  string
	CategoryID    uuid.UUID
	MinPrice      *float64        
	MaxPrice      *float64        
	AllowDelivery bool
	Attributes    json.RawMessage // Подготовленный JSONB ([]byte) для колонки attributes
}

// CreateOfferResult содержит данные, возвращаемые репозиторием после выполнения INSERT ... RETURNING
type CreateOfferResult struct {
	OfferedItemID uuid.UUID
	DesiredItemID uuid.UUID
	Status        string
	CreatedAt     time.Time
}