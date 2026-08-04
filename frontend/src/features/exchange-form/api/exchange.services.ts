import type { ExchangeFormDataOutput } from '@features/exchange-form/model/exchange-form-schema'

import { axiosWithAuth } from '@shared/api'

class ExchangeServices {
	async createExchange(data: ExchangeFormDataOutput) {
		const response = await axiosWithAuth({
			url: '/offers',
			method: 'POST',
			data
		})

		return response.data
	}
}

export const exchangeServices = new ExchangeServices()
