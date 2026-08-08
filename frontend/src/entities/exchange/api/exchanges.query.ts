import { useQuery } from '@tanstack/react-query'

import { getApiErrorMessage } from '@shared/lib'
import { useCurrentUserStore } from '@shared/model/current-user.store'

import { exchangeServices } from './exchange.service'

export const useExchanges = () => {
	const user = useCurrentUserStore(state => state.user)

	const { data, isLoading, error } = useQuery({
		queryKey: ['exchanges', user],
		queryFn: exchangeServices.getExchanges,
		enabled: !!user?.userId
	})

	return {
		data,
		isLoading,
		errorMessage: error ? getApiErrorMessage(error) : undefined
	}
}
