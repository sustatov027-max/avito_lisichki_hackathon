import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { chainServices } from './chain.services'
import { useChain } from './chains.query'

const mocks = vi.hoisted(() => ({
	user: null as { userId: string } | null
}))

vi.mock('./chain.services', () => ({
	chainServices: { getChains: vi.fn() }
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

describe('useChain', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		mocks.user = null
	})

	it('does not request a chain without both a user and chain id', async () => {
		renderHook(() => useChain('chain-1'), { wrapper: createWrapper() })
		await Promise.resolve()

		expect(chainServices.getChains).not.toHaveBeenCalled()
	})

	it('requests the selected chain after a user is available', async () => {
		mocks.user = { userId: 'user-1' }
		vi.mocked(chainServices.getChains).mockResolvedValue({
			chain_id: 'chain-1'
		} as never)

		const { result } = renderHook(() => useChain('chain-1'), {
			wrapper: createWrapper()
		})

		await waitFor(() =>
			expect(result.current.chain).toEqual({ chain_id: 'chain-1' })
		)
		expect(chainServices.getChains).toHaveBeenCalledWith('chain-1')
	})

	it('exposes a readable error message when the request fails', async () => {
		mocks.user = { userId: 'user-1' }
		vi.mocked(chainServices.getChains).mockRejectedValue(
			new Error('Network error')
		)

		const { result } = renderHook(() => useChain('chain-1'), {
			wrapper: createWrapper()
		})

		await waitFor(() =>
			expect(result.current.errorMessage).toBe('Network error')
		)
	})
})
