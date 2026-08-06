package dto

import "time"

type GetChainsResponse struct {
	Chains []ChainResponse `json:"chains"`
}

type ChainResponse struct {
	ChainID     string            `json:"chain_id"`
	Status      string            `json:"status"`
	ChainLength int               `json:"chain_length"`
	CreatedAt   time.Time         `json:"created_at"`
	ExpiresAt   time.Time         `json:"expires_at"`
	TimeLeft    int64             `json:"time_left_seconds"`
	MySummary   MySummaryResponse `json:"my_summary"`
	Steps       []StepResponse    `json:"steps"`
}

type MySummaryResponse struct {
	UserActionRequired bool         `json:"user_action_required"`
	MyDecision         string       `json:"my_decision"`
	GivingItem         ItemSummary  `json:"giving_item"`
	ReceivingItem      ReceivedItem `json:"receiving_item"`
}

type ItemSummary struct {
	ID             string  `json:"id"`
	Title          string  `json:"title"`
	Photo          string  `json:"photo"`
	EstimatedPrice float64 `json:"estimated_price"`
}

type ReceivedItem struct {
	ItemSummary
	FromUser UserSummary `json:"from_user"`
}

type StepResponse struct {
	Order      int          `json:"step_order"`
	FromUser   UserResponse `json:"from_user"`
	ToUser     UserResponse `json:"to_user"`
	Item       ItemResponse `json:"item"`
	IsAccepted *bool        `json:"is_accepted"`
}

type UserResponse struct {
	ID   string `json:"id"`
	Name string `json:"name"`
	City string `json:"city"`
	IsMe bool   `json:"is_me"`
}

type UserSummary struct {
	ID   string `json:"id"`
	Name string `json:"name"`
	City string `json:"city"`
}

type ItemResponse struct {
	ID         string `json:"id"`
	Title      string `json:"title"`
	CategoryID string `json:"category_id"`
	Photo      string `json:"photo"`
}

type DecisionRequest struct {
	Action string `json:"action" binding:"required,oneof=accept reject"`
}

type DecisionResponse struct {
	ChainID string `json:"chain_id"`
	Status  string `json:"status"`
	Message string `json:"message"`
}
