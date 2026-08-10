import { beforeEach, describe, expect, it, vi } from 'vitest'

import { axiosWithAuth } from '@shared/api'

import { chainServices } from './chain.services'

vi.mock('@shared/api', () => ({
	axiosWithAuth: vi.fn()
}))

describe('chainServices.getChains', () => {
	beforeEach(() => vi.clearAllMocks())

	it('requests a chain by id and returns response data', async () => {
		const data = { chain_id: 'chain-1' }
		vi.mocked(axiosWithAuth).mockResolvedValue({ data } as never)

		await expect(chainServices.getChains('chain-1')).resolves.toEqual(data)
		expect(axiosWithAuth).toHaveBeenCalledWith({
			url: '/chain/chain-1',
			method: 'GET'
		})
	})
})
