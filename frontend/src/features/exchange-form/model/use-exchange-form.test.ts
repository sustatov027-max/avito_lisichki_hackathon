import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useExchangeStepFormStore } from './exchange-form-step.store'

vi.mock('@features/exchange-form/api/exchange.mutation', () => ({
	useCreatExchange: () => ({ createExchange: vi.fn(), isPending: false })
}))

import { useExchangeForm } from './use-exchange-form'

describe('useExchangeForm', () => {
	beforeEach(() => {
		vi.useFakeTimers()
		useExchangeStepFormStore.getState().reset()
	})

	it('persists changed values after debounce', () => {
		const { result } = renderHook(() => useExchangeForm())

		act(() => result.current.setValue('user_id', 'user-123'))
		act(() => vi.advanceTimersByTime(500))

		expect(useExchangeStepFormStore.getState().data.user_id).toBe('user-123')
		vi.useRealTimers()
	})
})
