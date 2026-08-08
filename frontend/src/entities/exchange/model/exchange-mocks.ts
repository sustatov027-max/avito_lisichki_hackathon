import type { ExchangesResponse } from './exchange.types'

export const EXCHAGES = {
	items: [
		{
			offered_item_id: '3961f836-362a-4e9d-99d7-5eef8814618d',
			title: 'Chery Tiggo 7 Pro Max (Новая)',
			category_id: '00000000-0000-0000-0000-000000000101',
			estimated_price: 1100000.0,
			city_name: 'Москва',
			delivery_enabled: true,
			photos: [],
			item_status: 'active',
			created_at: '2026-08-05T20:11:50Z',
			desired_item: {
				id: '565dcaf6-f916-448b-b78e-685d16294690',
				title_pattern: 'Cherry Tiggo 7 Pro Max',
				category_id: '00000000-0000-0000-0000-000000000101',
				min_price: 1000000.0,
				max_price: 1200000.0,
				allow_delivery: true
			},
			chain_info: {
				has_chain: true,
				chain_id: 'e9394d3c-1f89-4475-8baa-84748ea70cda',
				status: 'proposed',
				chain_length: 2,
				user_action_required: true
			}
		},
		{
			offered_item_id: '77777777-7777-7777-7777-777777777777',
			title: 'Игровая приставка PlayStation 5',
			category_id: '00000000-0000-0000-0000-000000000202',
			estimated_price: 50000.0,
			city_name: 'Москва',
			delivery_enabled: false,
			photos: [],
			item_status: 'active',
			created_at: '2026-08-06T10:00:00Z',
			desired_item: {
				id: '88888888-8888-8888-8888-888888888888',
				title_pattern: 'Игровой ноутбук',
				category_id: '00000000-0000-0000-0000-000000000203',
				min_price: 45000.0,
				max_price: 60000.0,
				allow_delivery: true
			},
			chain_info: {
				has_chain: false,
				chain_id: null,
				status: 'searching',
				chain_length: null,
				user_action_required: false
			}
		}
	],
	total: 2
} satisfies ExchangesResponse
