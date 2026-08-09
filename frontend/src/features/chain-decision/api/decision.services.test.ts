import { beforeEach, describe, expect, it, vi } from 'vitest'

import { axiosWithAuth } from '@shared/api'

import { decisionServices } from './decision.services'

vi.mock('@shared/api', () => ({
	axiosWithAuth: vi.fn()
}))

describe('decisionServices', () => {
	beforeEach(() => vi.clearAllMocks())

	it.each([
		['acceptChain', 'accept'],
		['rejectChain', 'reject']
	] as const)('sends the %s decision', async (method, action) => {
		const data = { chain_id: 'chain-1', status: 'accepted', message: 'ok' }
		vi.mocked(axiosWithAuth).mockResolvedValue({ data } as never)

		await expect(decisionServices[method]('chain-1')).resolves.toEqual(data)
		expect(axiosWithAuth).toHaveBeenCalledWith({
			url: '/chains/chain-1/decision',
			method: 'POST',
			data: { action }
		})
	})
})
