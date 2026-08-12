import { serializeExchangeFormData } from '@features/create-exchange-form/model/create-exchange-form.helpers'
import type { ExchangeFormDataOutput } from '@features/create-exchange-form/model/create-exchange-form.schema'

import { axiosWithAuth } from '@shared/api'

class CreateExchangeServices {
	async createExchange(data: ExchangeFormDataOutput, idenpotentKey: string) {
		const response = await axiosWithAuth({
			url: '/offers',
			method: 'POST',
			data: serializeExchangeFormData(data),
			headers: {
				'Idempotency-Key': idenpotentKey
			}
		})

		return response.data
	}
}

export const createExchangeServices = new CreateExchangeServices()
