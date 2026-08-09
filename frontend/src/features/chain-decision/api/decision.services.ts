import type { AxiosResponse } from 'axios'

import { axiosWithAuth } from '@shared/api'

import type {
	ChainDecisionBody,
	ChainDecisionResponse
} from '../model/decision.types'

class DecisionServices {
	async acceptChain(chainId: string) {
		const response = await axiosWithAuth<
			ChainDecisionResponse,
			AxiosResponse<ChainDecisionResponse>,
			ChainDecisionBody
		>({
			url: `/chains/${chainId}/decision`,
			method: 'POST',
			data: {
				action: 'accept'
			}
		})

		return response.data
	}

	async rejectChain(chainId: string) {
		const response = await axiosWithAuth<
			ChainDecisionResponse,
			AxiosResponse<ChainDecisionResponse>,
			ChainDecisionBody
		>({
			url: `/chains/${chainId}/decision`,
			method: 'POST',
			data: {
				action: 'reject'
			}
		})

		return response.data
	}
}

export const decisionServices = new DecisionServices()
