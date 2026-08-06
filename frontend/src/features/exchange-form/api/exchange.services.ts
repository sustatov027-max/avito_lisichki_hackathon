import type { ExchangeFormDataOutput } from '@features/exchange-form/model/exchange-form.schema'

import { axiosWithAuth } from '@shared/api'

class ExchangeServices {
	async createExchange(data: ExchangeFormDataOutput, idenpotentKey: string) {
		const response = await axiosWithAuth({
			url: '/offers',
			method: 'POST',
			data,
			headers: {
				'Idempotency-Key': idenpotentKey
			}
		})

		return response.data
	}
}

export const exchangeServices = new ExchangeServices()
