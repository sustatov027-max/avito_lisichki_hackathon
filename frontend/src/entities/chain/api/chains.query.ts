import { useQuery } from '@tanstack/react-query'

import { chainServices } from '@entities/chain/api/chain.services'
import { getChainById } from '@entities/chain/model/chain.helpers'

import { getApiErrorMessage } from '@shared/lib'
import { useCurrentUserStore } from '@shared/model/current-user.store'

export const useChain = (chainId: string | null) => {
	const user = useCurrentUserStore(state => state.user)

	const { data, isLoading, error } = useQuery({
		queryKey: ['chains', user?.userId],
		queryFn: () => chainServices.getChains(),
		enabled: Boolean(user?.userId && chainId)
	})

	const chain = chainId ? getChainById(chainId, data?.chains ?? null) : null

	return {
		chain,
		isLoading,
		errorMessage: error ? getApiErrorMessage(error) : undefined
	}
}
