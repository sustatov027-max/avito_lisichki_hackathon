package repository

import (
	"errors"

	"github.com/google/uuid"
)

var (
	ErrChainNotFound        = errors.New("exchange chain not found")
	ErrChainNotProposed     = errors.New("chain is no longer in proposed status")
	ErrChainExpired         = errors.New("chain has expired and can no longer be decided")
	ErrStepNotFound         = errors.New("user is not a participant in this chain step")
	ErrAlreadyDecided       = errors.New("decision has already been recorded for this user")
	ErrInvalidAction        = errors.New("invalid decision action: must be 'accept' or 'reject'")
	ErrItemsAlreadyReserved = errors.New("one or more items in the chain are no longer available")
)

type ProcessDecisionParams struct {
	ChainID uuid.UUID
	UserID  uuid.UUID
	Action  string // "accept" или "reject"
}

type ProcessDecisionResult struct {
	ChainID uuid.UUID
	Status  string // "proposed", "accepted", "rejected"
}
