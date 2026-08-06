import { beforeEach, describe, expect, it } from 'vitest'

import { EXCHANGE_STEPS } from './exchange-form.config'
import { useExchangeStepFormStore } from './exchange-form-step.store'

describe('useExchangeStepFormStore', () => {
	beforeEach(() => {
		useExchangeStepFormStore.getState().reset()
	})

	it('moves through steps and stops at boundaries', () => {
		const store = useExchangeStepFormStore.getState()
		store.backStep()
		expect(useExchangeStepFormStore.getState().step).toBe(EXCHANGE_STEPS.ONBOARD)
		store.forwardStep()
		store.forwardStep()
		expect(useExchangeStepFormStore.getState().step).toBe(EXCHANGE_STEPS.WANTED)
		store.forwardStep()
		store.forwardStep()
		expect(useExchangeStepFormStore.getState().step).toBe(EXCHANGE_STEPS.CONFIRM)
	})

	it('merges and resets form data', () => {
		const store = useExchangeStepFormStore.getState()
		store.updateData({ user_id: 'user-1' })
		store.updateData({ city_name: 'Москва' })
		expect(useExchangeStepFormStore.getState().data).toEqual({ user_id: 'user-1', city_name: 'Москва' })
		store.reset()
		expect(useExchangeStepFormStore.getState().data).toEqual({})
	})
})
