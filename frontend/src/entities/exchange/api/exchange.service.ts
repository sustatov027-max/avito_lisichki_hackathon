import type { AxiosResponse } from 'axios'

import { axiosWithAuth } from '@shared/api'

import type { ExchangesResponse } from '../model/exchange.types'

class ExchangeServices {
	async getExchanges(): Promise<ExchangesResponse> {
		const response: AxiosResponse<ExchangesResponse> = await axiosWithAuth({
			url: '/offers/my',
			method: 'GET'
		})

		return response.data
	}
}

export const exchangeServices = new ExchangeServices()
