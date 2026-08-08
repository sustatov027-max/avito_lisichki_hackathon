import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'

import type { ExchangeItem } from '../model/exchange.types'

import { ExchangeCard } from './ExchangeCard'

const createExchange = (chainId: string | null): ExchangeItem => ({
	offered_item_id: 'offer-1',
	title: 'Игровая приставка',
	category_id: '00000000-0000-0000-0000-000000000101',
	estimated_price: 50000,
	city_name: 'Москва',
	delivery_enabled: true,
	photos: [],
	item_status: 'active',
	created_at: '2026-08-05T20:11:50Z',
	desired_item: {
		id: 'desired-1',
		title_pattern: 'Игровой ноутбук',
		category_id: '00000000-0000-0000-0000-000000000102',
		min_price: 45000,
		max_price: 60000,
		allow_delivery: true
	},
	chain_info: {
		has_chain: Boolean(chainId),
		chain_id: chainId,
		status: chainId ? 'proposed' : 'searching',
		chain_length: chainId ? 2 : null,
		user_action_required: Boolean(chainId)
	}
})

describe('ExchangeCard', () => {
	it('shows a chain indicator and links to the chain', () => {
		render(
			<MemoryRouter>
				<ExchangeCard exchange={createExchange('chain-1')} />
			</MemoryRouter>
		)

		expect(screen.getByText('Есть цепочка обмена')).toBeInTheDocument()
		expect(screen.getByRole('link')).toHaveAttribute('href', '/chains/chain-1')
	})

	it('renders a non-clickable card when there is no chain', () => {
		render(
			<MemoryRouter>
				<ExchangeCard exchange={createExchange(null)} />
			</MemoryRouter>
		)

		expect(screen.getByText('Цепочка ещё формируется')).toBeInTheDocument()
		expect(screen.queryByRole('link')).not.toBeInTheDocument()
	})
})
