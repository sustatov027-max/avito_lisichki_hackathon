package dto

type DecisionRequest struct {
	Action string `json:"action" binding:"required,oneof=accept reject"`
}

type DecisionResponse struct {
	ChainID string `json:"chain_id"`
	Status  string `json:"status"`
	Message string `json:"message"`
}
