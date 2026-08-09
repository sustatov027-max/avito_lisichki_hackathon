export type ChainDecisionBody = {
	action: 'accept' | 'reject'
}

export type ChainDecisionResponse = {
	chain_id: string
	status: 'proposed' | 'accepted'
	message: string
}
