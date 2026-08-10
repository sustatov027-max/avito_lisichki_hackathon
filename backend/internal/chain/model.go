package chains

import (
	"encoding/json"
	"errors"
	"time"

	"github.com/google/uuid"
)

type DecisionAction string

var (
	ErrInvalidUserID                 = errors.New("invalid user id")
	ErrInvalidChainID                = errors.New("invalid chain id")
	ErrIncomplete                    = errors.New("chain does not contain both user directions")
	ActionAccept      DecisionAction = "accept"
	ActionReject      DecisionAction = "reject"
)

type Chain struct {
	ID          uuid.UUID
	Status      string
	ChainLength int
	CreatedAt   time.Time
	ExpiresAt   time.Time
	Steps       []Step
}

type Step struct {
	Order      int
	FromUser   User
	ToUser     User
	Item       Item
	IsAccepted *bool
}

type User struct {
	ID   uuid.UUID
	Name string
	City string
}

type Item struct {
	ID             uuid.UUID
	Title          string
	Description    string
	CategoryID     uuid.UUID
	Photo          string
	Attributes     json.RawMessage
	EstimatedPrice float64
}

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
