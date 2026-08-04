package dto

import "time"

type GetChainResponse struct {
	ID          string         `json:"id"`
	Status      string         `json:"status"`
	ChainLength int            `json:"chain_length"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	Steps       []StepResponse `json:"steps"`
}

type StepResponse struct {
	ID             string `json:"id"`
	Order          int    `json:"step_order"`
	FromUserID     string `json:"from_user_id"`
	ToUserID       string `json:"to_user_id"`
	OfferedItemID  string `json:"offered_item_id"`
	ReceivedItemID string `json:"received_item_id"`
	IsAccepted     *bool  `json:"is_accepted"`
}
