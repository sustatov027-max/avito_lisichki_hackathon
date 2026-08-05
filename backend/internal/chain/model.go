package chain

import (
	"github.com/google/uuid"
)

type DecisionAction string

const (
	ActionAccept DecisionAction = "accept"
	ActionReject DecisionAction = "reject"
)

type DecisionRequest struct {
	Action DecisionAction `json:"action" binding:"required,oneof=accept reject"`
}

type DecisionResponse struct {
	ChainID uuid.UUID `json:"chain_id"`
	Status  string    `json:"status"`
	Message string    `json:"message"`
}

type DecisionResult struct {
	ChainID uuid.UUID
	Status  string
	Message string
}
