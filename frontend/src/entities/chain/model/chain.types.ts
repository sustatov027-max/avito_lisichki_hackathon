export type ChainStatus =
	| 'proposed'
	| 'searching'
	| 'accepted'
	| 'completed'
	| 'expired'
	| 'rejected'
	| 'invalidated'

export type TerminalStatuses =
	'accepted' | 'completed' | 'expired' | 'rejected' | 'invalidated'

export type ChainDecision = 'pending' | 'accepted' | 'rejected'

export type ChainUser = {
	id: string
	name: string
	city: string
	is_me?: boolean
}

export type ChainItemAttribute = {
	attribute_id: string
	value?: string | number
	values?: string[]
	min_value?: number
	max_value?: number
}

export type ChainItem = {
	id: string
	title: string
	category_id?: string
	photos: string[]
	estimated_price: number
	from_user?: ChainUser
	is_accepted: boolean | null
	description: string
	attributes: ChainItemAttribute[]
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
		| 'id'
		| 'title'
		| 'category_id'
		| 'photos'
		| 'estimated_price'
		| 'is_accepted'
		| 'description'
		| 'attributes'
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
