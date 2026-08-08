import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useCreatExchange } from './create-exchange.mutation'
import { createExchangeServices } from './create-exchange.services'

vi.mock('./create-exchange.services', () => ({
	createExchangeServices: { createExchange: vi.fn() }
}))

vi.mock('react-hot-toast', () => ({
	default: { success: vi.fn(), error: vi.fn() }
}))

const createWrapper = () => {
	const client = new QueryClient({
		defaultOptions: { mutations: { retry: false } }
	})
	return ({ children }: { children: React.ReactNode }) => (
		<QueryClientProvider client={client}>{children}</QueryClientProvider>
	)
}

describe('useCreatExchange', () => {
	it('creates an exchange with generated idempotency key', async () => {
		vi.mocked(createExchangeServices.createExchange).mockResolvedValue({
			id: 'offer-1'
		})
		const { result } = renderHook(() => useCreatExchange(), {
			wrapper: createWrapper()
		})

		result.current.createExchange({} as never)

		await waitFor(() =>
			expect(createExchangeServices.createExchange).toHaveBeenCalled()
		)
		expect(
			vi.mocked(createExchangeServices.createExchange).mock.calls[0]?.[1]
		).toMatch(/^[0-9a-f-]{36}$/)
	})
})
