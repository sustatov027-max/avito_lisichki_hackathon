export type ExchangeItemStatus = 'active' | 'inactive' | 'completed'

export type ExchangeChainStatus = 'proposed' | 'searching' | 'accepted'

export type DesiredExchangeItem = {
	id: string
	title_pattern: string
	category_id: string
	min_price: number
	max_price: number
	allow_delivery: boolean
}

export type ExchangeChainInfo = {
	has_chain: boolean
	chain_id: string | null
	status: ExchangeChainStatus
	chain_length: number | null
	user_action_required: boolean
}

export type ExchangeItem = {
	offered_item_id: string
	title: string
	category_id: string
	estimated_price: number
	city_name: string
	delivery_enabled: boolean
	photos: string[]
	item_status: ExchangeItemStatus
	created_at: string
	desired_item: DesiredExchangeItem
	chain_info: ExchangeChainInfo
}

export type ExchangesResponse = {
	items: ExchangeItem[]
	total: number
}
