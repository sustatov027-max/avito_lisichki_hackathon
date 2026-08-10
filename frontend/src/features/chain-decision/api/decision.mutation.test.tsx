import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { decisionServices } from './decision.services'
import { useChainDecision } from './decision.mutation'

const mocks = vi.hoisted(() => ({
	user: { userId: 'user-1' } as { userId: string } | null,
	success: vi.fn(),
	error: vi.fn(),
	isAxiosError: vi.fn()
}))

vi.mock('./decision.services', () => ({
	decisionServices: {
		acceptChain: vi.fn(),
		rejectChain: vi.fn()
	}
}))

vi.mock('@shared/model/current-user.store', () => ({
	useCurrentUserStore: (selector: (state: typeof mocks) => unknown) =>
		selector(mocks)
}))

vi.mock('react-hot-toast', () => ({
	default: { success: mocks.success, error: mocks.error }
}))

vi.mock('axios', () => ({
	default: { isAxiosError: mocks.isAxiosError }
}))

const createWrapper = (client: QueryClient) =>
	function Wrapper(props: PropsWithChildren) {
		return (
			<QueryClientProvider client={client}>{props.children}</QueryClientProvider>
		)
	}

describe('useChainDecision', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		mocks.user = { userId: 'user-1' }
		mocks.isAxiosError.mockReturnValue(false)
	})

	it('accepts a chain, notifies the user, and refreshes related data', async () => {
		const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
		const invalidateQueries = vi.spyOn(client, 'invalidateQueries')
		vi.mocked(decisionServices.acceptChain).mockResolvedValue({} as never)

		const { result } = renderHook(() => useChainDecision(), {
			wrapper: createWrapper(client)
		})
		result.current.accept('chain-1')

		await waitFor(() =>
			expect(decisionServices.acceptChain).toHaveBeenCalledWith('chain-1')
		)
		await waitFor(() => expect(mocks.success).toHaveBeenCalledWith('Вы согласились с этой цепочкой'))
		expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['exchanges'] })
		expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['chain', 'user-1'] })
	})

	it('shows the server error after a rejected decision', async () => {
		const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
		const requestError = { response: { data: { error: 'Цепочка уже закрыта' } } }
		mocks.isAxiosError.mockReturnValue(true)
		vi.mocked(decisionServices.rejectChain).mockRejectedValue(requestError)

		const { result } = renderHook(() => useChainDecision(), {
			wrapper: createWrapper(client)
		})
		result.current.reject('chain-1')

		await waitFor(() =>
			expect(mocks.error).toHaveBeenCalledWith('Цепочка уже закрыта')
		)
	})
})
