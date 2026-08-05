package chains

import (
	"errors"
	"time"

	"github.com/google/uuid"
)

var (
	ErrInvalidChainID = errors.New("invalid chain id")
	ErrInvalidUserID  = errors.New("invalid user id")
	ErrNotFound       = errors.New("chain not found")
	ErrIncomplete     = errors.New("chain does not contain both user directions")
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
	CategoryID     uuid.UUID
	Photo          string
	EstimatedPrice float64
}
