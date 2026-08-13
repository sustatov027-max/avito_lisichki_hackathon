import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { useChainModalStore } from '@entities/chain/model/chain-modal.store'
import type { ChainSummary } from '@entities/chain/model/chain.types'

import { ChainExchangeSummary } from './ChainExchangeSummary'

const summary: ChainSummary = {
	user_action_required: true,
	my_decision: 'pending',
	giving_item: {
		id: 'giving-item',
		title: 'Горный велосипед',
		category_id: 'bikes',
		photos: [],
		estimated_price: 50000,
		is_accepted: null,
		description: 'Описание велосипеда',
		attributes: []
	},
	receiving_item: {
		id: 'receiving-item',
		title: 'Фотоаппарат',
		category_id: 'electronics',
		photos: [],
		estimated_price: 45000,
		is_accepted: null,
		description: 'Описание фотоаппарата',
		attributes: []
	}
}

describe('ChainExchangeSummary', () => {
	beforeEach(() => {
		useChainModalStore.setState({ activeModal: null })
	})

	it('shows the items and opens their details', () => {
		render(<ChainExchangeSummary summary={summary} />)

		expect(screen.getByText('Горный велосипед')).toBeInTheDocument()
		expect(screen.getByText('Фотоаппарат')).toBeInTheDocument()

		fireEvent.click(
			screen.getByRole('button', {
				name: /Вы получаете: Фотоаппарат/
			})
		)

		expect(useChainModalStore.getState().activeModal).toBe('receiving-item')
	})
})
