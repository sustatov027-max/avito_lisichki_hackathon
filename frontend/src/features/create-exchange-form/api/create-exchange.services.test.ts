import { beforeEach, describe, expect, it, vi } from 'vitest'

import { axiosWithAuth } from '@shared/api'

import type { ExchangeFormDataOutput } from '../model/create-exchange-form.schema'

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
		const photo = new File(['photo'], 'phone.jpg', { type: 'image/jpeg' })
		const data = {
			city_name: 'Москва',
			delivery_enabled: false,
			photos: [photo],
			offered_item: { attributes: [] },
			wanted_item: { attributes: [] }
		} as unknown as ExchangeFormDataOutput

		await expect(
			createExchangeServices.createExchange(data, 'key-1')
		).resolves.toEqual({ id: 'offer-1' })
		const request = vi.mocked(axiosWithAuth).mock.calls[0]?.[0] as unknown as {
			url: string
			method: string
			data: FormData
			headers: Record<string, string>
		}
		const formData = request.data

		expect(request).toMatchObject({
			url: '/offers',
			method: 'POST',
			headers: { 'Idempotency-Key': 'key-1' }
		})
		expect(formData.get('photos')).toBe(photo)
		expect(JSON.parse(String(formData.get('payload')))).toMatchObject({
			city_name: 'Москва',
			delivery_enabled: false
		})
	})
})
