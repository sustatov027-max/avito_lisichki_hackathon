import { beforeEach, describe, expect, it } from 'vitest'

import { useChainModalStore } from './chain-modal.store'
import type { ChainStep } from './chain.types'

const steps = [
	{ item: { id: 'item-1' } },
	{ item: { id: 'item-2' } }
] as ChainStep[]

describe('useChainModalStore', () => {
	beforeEach(() => {
		useChainModalStore.setState({ modalIds: [], activeModal: null })
	})

	it('stores ids of items that can be opened in a modal', () => {
		useChainModalStore.getState().setModalIds(steps)

		expect(useChainModalStore.getState().modalIds).toEqual(['item-1', 'item-2'])
	})

	it('opens and closes the selected modal', () => {
		useChainModalStore.getState().setActiveModal('item-1')
		expect(useChainModalStore.getState().activeModal).toBe('item-1')

		useChainModalStore.getState().disactiveModal()
		expect(useChainModalStore.getState().activeModal).toBeNull()
	})
})
