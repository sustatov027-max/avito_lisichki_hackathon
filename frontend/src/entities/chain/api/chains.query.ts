import { useQuery } from '@tanstack/react-query'

import { chainServices } from '@entities/chain/api/chain.services'

import { getApiErrorMessage } from '@shared/lib'
import { useCurrentUserStore } from '@shared/model/current-user.store'

export const useChain = (chainId: string) => {
	const user = useCurrentUserStore(state => state.user)

	const {
		data: chain,
		isLoading,
		error
	} = useQuery({
		queryKey: ['chain', user?.userId],
		queryFn: () => chainServices.getChains(chainId),
		enabled: Boolean(user?.userId && chainId)
	})

	return {
		chain,
		isLoading,
		errorMessage: error ? getApiErrorMessage(error) : undefined
	}
}
