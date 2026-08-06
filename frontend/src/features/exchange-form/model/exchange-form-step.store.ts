import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { EXCHANGE_STEPS } from '@features/exchange-form'

import type { ExchangeFormStepState } from './exchange-form.types'

const steps = Object.values(EXCHANGE_STEPS)

export const useExchangeStepFormStore = create<ExchangeFormStepState>()(
	persist(
		set => ({
			step: EXCHANGE_STEPS.ONBOARD,
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
					step: EXCHANGE_STEPS.ONBOARD,
					data: {}
				}),
			forwardStep: () =>
				set(state => {
					const currentIndex = steps.indexOf(state.step)
					const nextStep = steps[currentIndex + 1]

					return nextStep ? { step: nextStep } : state
				}),
			backStep: () =>
				set(state => {
					const currentIndex = steps.indexOf(state.step)
					const previousStep = steps[currentIndex - 1]

					return previousStep ? { step: previousStep } : state
				})
		}),

		{
			name: 'exchange-form',
			storage: createJSONStorage(() => sessionStorage)
		}
	)
)
