import { act } from '@testing-library/react'
import { beforeEach, describe, it, vi } from 'vitest'

import { useExchangeStepFormStore } from './create-exchange-form-step.store'

vi.mock('@features/create-exchange-form/api/exchange.mutation', () => ({
	useCreatExchange: () => ({ createExchange: vi.fn(), isPending: false })
}))

describe('useExchangeForm', () => {
	beforeEach(() => {
		vi.useFakeTimers()
		useExchangeStepFormStore.getState().reset()
	})

	it('persists changed values after debounce', () => {
		act(() => vi.advanceTimersByTime(500))

		vi.useRealTimers()
	})
})
