import { serializeExchangeFormData } from '@features/create-exchange-form/model/create-exchange-form.helpers'
import type { ExchangeFormDataOutput } from '@features/create-exchange-form/model/create-exchange-form.schema'

import { axiosWithAuth } from '@shared/api'

class CreateExchangeServices {
	async createExchange(data: ExchangeFormDataOutput, idenpotentKey: string) {
		const serializedData = serializeExchangeFormData(data)
		const { photos, ...payload } = serializedData
		const formData = new FormData()

		formData.append('payload', JSON.stringify(payload))
		photos.forEach(photo => formData.append('photos', photo))

		const response = await axiosWithAuth({
			url: '/offers',
			method: 'POST',
			data: formData,
			headers: {
				'Idempotency-Key': idenpotentKey
			}
		})

		return response.data
	}
}

export const createExchangeServices = new CreateExchangeServices()
