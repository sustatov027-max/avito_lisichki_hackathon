export type ChainStatus =
	'proposed' | 'searching' | 'accepted' | 'completed' | 'expired' | 'rejected'

export type ChainDecision = 'pending' | 'accepted' | 'rejected'

export type ChainUser = {
	id: string
	name: string
	city: string
	is_me?: boolean
}

export type ChainItem = {
	id: number
	title: string
	category_id?: string
	photo: string
	estimated_price: number
	from_user?: ChainUser
	is_accepted: boolean | null
	description: string
}

export type ChainSummary = {
	user_action_required: boolean
	my_decision: ChainDecision
	giving_item: ChainItem
	receiving_item: ChainItem
}

export type ChainStep = {
	step_order: number
	from_user: ChainUser
	to_user: ChainUser
	item: Pick<
		ChainItem,
		'id' | 'title' | 'category_id' | 'photo' | 'is_accepted' | 'description'
	>
	is_accepted: boolean | null
}

export type Chain = {
	chain_id: string
	status: ChainStatus
	chain_length: number
	created_at: string
	expires_at: string
	time_left_seconds: number
	my_summary: ChainSummary
	steps: ChainStep[]
}

export type ChainsResponse = Chain

export type ChainModalStoreState = {
	modalIds: string[]
	activeModal: string | null

	setModalIds: (items: ChainStep[]) => void
	setActiveModal: (activeModalId: string) => void
	disactiveModal: () => void
}
