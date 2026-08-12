package dto

import (
	"encoding/json"
	"time"
)

type GetChainsResponse struct {
	Chains []ChainResponse `json:"chains"`
}

type ChainResponse struct {
	ChainID     string            `json:"chain_id" example:"123e4567-e89b-12d3-a456-426614174000"`
	Status      string            `json:"status" example:"pending"`
	ChainLength int               `json:"chain_length" example:"3"`
	CreatedAt   time.Time         `json:"created_at" example:"2026-08-09T12:00:00Z"`
	ExpiresAt   time.Time         `json:"expires_at" example:"2026-08-10T12:00:00Z"`
	TimeLeft    int64             `json:"time_left_seconds" example:"3600"`
	MySummary   MySummaryResponse `json:"my_summary"`
	Steps       []StepResponse    `json:"steps"`
}

type MySummaryResponse struct {
	UserActionRequired bool         `json:"user_action_required" example:"true"`
	MyDecision         string       `json:"my_decision" example:"accept"`
	GivingItem         ItemSummary  `json:"giving_item"`
	ReceivingItem      ReceivedItem `json:"receiving_item"`
}

type ItemSummary struct {
	ID             string          `json:"id" example:"item-uuid-1"`
	Title          string          `json:"title" example:"Vintage Lamp"`
	Description    string          `json:"description" example:"A nice vintage lamp in working condition"`
	CategoryID     string          `json:"category_id" example:"home-decor"`
	Photos         []string        `json:"photos" example:"https://example.com/photos/1.jpg,https://example.com/photos/2.jpg"`
	Attributes     json.RawMessage `json:"attributes,omitempty"`
	EstimatedPrice float64         `json:"estimated_price" example:"1999.99"`
}

type ReceivedItem struct {
	ItemSummary
	FromUser UserSummary `json:"from_user"`
}

type StepResponse struct {
	Order      int          `json:"step_order" example:"1"`
	FromUser   UserResponse `json:"from_user"`
	ToUser     UserResponse `json:"to_user"`
	Item       ItemResponse `json:"item"`
	IsAccepted *bool        `json:"is_accepted" example:"true"`
}

type UserResponse struct {
	ID   string `json:"id" example:"user-uuid-1"`
	Name string `json:"name" example:"Ivan Petrov"`
	City string `json:"city" example:"Moscow"`
	IsMe bool   `json:"is_me" example:"true"`
}

type UserSummary struct {
	ID   string `json:"id" example:"user-uuid-1"`
	Name string `json:"name" example:"Ivan Petrov"`
	City string `json:"city" example:"Moscow"`
}

type ItemResponse struct {
	ID          string          `json:"id" example:"item-uuid-2"`
	Title       string          `json:"title" example:"Child Bike"`
	Description string          `json:"description" example:"Small bike for 4-6 years old"`
	CategoryID  string          `json:"category_id" example:"kids-bikes"`
	Photos      []string        `json:"photos" example:"https://example.com/photos/1.jpg,https://example.com/photos/2.jpg"`
	Attributes  json.RawMessage `json:"attributes,omitempty"`
}

type DecisionRequest struct {
	Action string `json:"action" binding:"required,oneof=accept reject" example:"accept"`
}

type DecisionResponse struct {
	ChainID string `json:"chain_id" example:"123e4567-e89b-12d3-a456-426614174000"`
	Status  string `json:"status" example:"processed"`
	Message string `json:"message" example:"Decision accepted"`
}
