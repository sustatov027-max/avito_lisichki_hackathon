import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import type { ExchangeFormStepState } from './exchange-form.types'

export const useExchangeStepFormStore = create<ExchangeFormStepState>()(
	persist(
		set => ({
			step: 'amount',

			data: {},

			setStep: step =>
				set({
					step
				}),

			updateData: data =>
				set(state => ({
					data: {
						...state.data,
						...data
					}
				})),

			reset: () =>
				set({
					step: 'amount',
					data: {}
				})
		}),

		{
			name: 'exchange-form',
			storage: createJSONStorage(() => sessionStorage)
		}
	)
)
