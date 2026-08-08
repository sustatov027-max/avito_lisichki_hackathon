import { beforeEach, describe, expect, it, vi } from 'vitest'

import { axiosWithAuth } from '@shared/api'

import { createExchangeServices } from './create-exchange.services'

vi.mock('@shared/api', () => ({
	axiosWithAuth: vi.fn()
}))

describe('createExchangeServices.createExchange', () => {
	beforeEach(() => vi.clearAllMocks())

	it('posts data with idempotency key', async () => {
		vi.mocked(axiosWithAuth).mockResolvedValue({
			data: { id: 'offer-1' }
		} as never)
		const data = { user_id: 'user-1' } as never

		await expect(
			createExchangeServices.createExchange(data, 'key-1')
		).resolves.toEqual({ id: 'offer-1' })
		expect(axiosWithAuth).toHaveBeenCalledWith({
			url: '/offers',
			method: 'POST',
			data,
			headers: { 'Idempotency-Key': 'key-1' }
		})
	})
})
