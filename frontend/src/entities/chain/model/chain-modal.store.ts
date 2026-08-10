import { create } from 'zustand'

import type { ChainModalStoreState } from '@entities/chain/model/chain.types'

export const useChainModalStore = create<ChainModalStoreState>()(set => ({
	modalIds: [],
	activeModal: null,

	setModalIds: items =>
		set(state => {
			const IDs = items.map(({ item }) => item.id)

			return { ...state, modalIds: IDs }
		}),
	setActiveModal: id => set({ activeModal: id }),
	disactiveModal: () => set({ activeModal: null })
}))
