package chains

import (
	"errors"
	"time"

	"github.com/google/uuid"
)

var (
	ErrInvalidID = errors.New("invalid chain id")
	ErrNotFound  = errors.New("chain not found")
)

type Chain struct {
	ID          uuid.UUID
	Status      string
	ChainLength int
	CreatedAt   time.Time
	UpdatedAt   time.Time
	Steps       []Step
}

type Step struct {
	ID             uuid.UUID
	Order          int
	FromUserID     uuid.UUID
	ToUserID       uuid.UUID
	OfferedItemID  uuid.UUID
	ReceivedItemID uuid.UUID
	IsAccepted     *bool
}
