import { describe, expect, it } from 'vitest'

import { sortExchangesByChain } from './exchange.helpers'
import type { ExchangeItem } from './exchange.types'

const createExchange = (id: string, hasChain: boolean): ExchangeItem => ({
	offered_item_id: id,
	title: id,
	category_id: '00000000-0000-0000-0000-000000000101',
	estimated_price: 100,
	city_name: 'Москва',
	delivery_enabled: false,
	photos: [],
	item_status: 'active',
	created_at: '2026-08-05T20:11:50Z',
	desired_item: {
		id: `desired-${id}`,
		title_pattern: 'Товар',
		category_id: '00000000-0000-0000-0000-000000000102',
		min_price: 50,
		max_price: 150,
		allow_delivery: true
	},
	chain_info: {
		has_chain: hasChain,
		chain_id: hasChain ? `chain-${id}` : null,
		status: hasChain ? 'proposed' : 'searching',
		chain_length: hasChain ? 2 : null,
		user_action_required: hasChain
	}
})

describe('sortExchangesByChain', () => {
	it('puts exchanges with chains first without mutating the source array', () => {
		const exchanges = [
			createExchange('without-chain', false),
			createExchange('with-chain', true)
		]

		const result = sortExchangesByChain(exchanges)

		expect(result.map(exchange => exchange.offered_item_id)).toEqual([
			'with-chain',
			'without-chain'
		])
		expect(exchanges.map(exchange => exchange.offered_item_id)).toEqual([
			'without-chain',
			'with-chain'
		])
	})
})
