import type { AxiosResponse } from 'axios'

import { axiosWithAuth } from '@shared/api'

import type { ChainsResponse } from '../model/chain.types'

class ChainServices {
	async getChains() {
		const response: AxiosResponse<ChainsResponse> = await axiosWithAuth({
			url: '/chains',
			method: 'GET'
		})

		return response.data
	}
}

export const chainServices = new ChainServices()
