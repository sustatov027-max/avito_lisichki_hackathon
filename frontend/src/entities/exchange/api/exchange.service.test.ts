import { beforeEach, describe, expect, it, vi } from 'vitest'

import { axiosWithAuth } from '@shared/api'

import { exchangeServices } from './exchange.service'

vi.mock('@shared/api', () => ({
	axiosWithAuth: vi.fn()
}))

describe('exchangeServices.getExchanges', () => {
	beforeEach(() => vi.clearAllMocks())

	it('requests the current user exchanges and returns response data', async () => {
		const data = { items: [], total: 0 }
		vi.mocked(axiosWithAuth).mockResolvedValue({ data } as never)

		await expect(exchangeServices.getExchanges()).resolves.toEqual(data)
		expect(axiosWithAuth).toHaveBeenCalledWith({
			url: '/offers/my',
			method: 'GET'
		})
	})
})
