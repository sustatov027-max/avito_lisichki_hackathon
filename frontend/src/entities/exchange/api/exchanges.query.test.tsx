import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { USERS } from '@shared/constants/mock-users'

import { exchangeServices } from './exchange.service'
import { useExchanges } from './exchanges.query'

const mocks = vi.hoisted(() => ({
	user: null as (typeof USERS)[number] | null
}))

vi.mock('./exchange.service', () => ({
	exchangeServices: { getExchanges: vi.fn() }
}))

vi.mock('@shared/model/current-user.store', () => ({
	useCurrentUserStore: (selector: (state: typeof mocks) => unknown) =>
		selector(mocks)
}))

const createWrapper = () => {
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } }
	})

	return (props: PropsWithChildren) => (
		<QueryClientProvider client={client}>{props.children}</QueryClientProvider>
	)
}

describe('useExchanges', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		mocks.user = null
	})

	it('does not request exchanges without a selected user', async () => {
		renderHook(() => useExchanges(), { wrapper: createWrapper() })

		await Promise.resolve()
		expect(exchangeServices.getExchanges).not.toHaveBeenCalled()
	})

	it('requests exchanges after a user is selected', async () => {
		vi.mocked(exchangeServices.getExchanges).mockResolvedValue({
			items: [],
			total: 0
		})
		mocks.user = USERS[0]

		const { result } = renderHook(() => useExchanges(), {
			wrapper: createWrapper()
		})

		await waitFor(() =>
			expect(result.current.data).toEqual({ items: [], total: 0 })
		)
		expect(exchangeServices.getExchanges).toHaveBeenCalledTimes(1)
	})
})
