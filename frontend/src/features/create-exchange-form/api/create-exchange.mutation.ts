import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import toast from 'react-hot-toast'

import { createExchangeServices } from '@features/create-exchange-form/api/create-exchange.services'
import type { ExchangeFormDataOutput } from '@features/create-exchange-form/model/create-exchange-form.schema'
import { useExchangeFormStore } from '@features/create-exchange-form/model/create-exchange-form.store'

import { useCurrentUserStore } from '@shared/model/current-user.store'

export const useCreatExchange = () => {
	const createKey = useExchangeFormStore(s => s.createIdempotencyKey)
	const key = useExchangeFormStore(s => s.idempotencyKey)

	const user = useCurrentUserStore(state => state.user)

	const queryClient = useQueryClient()

	const { mutate: createExchange, isPending } = useMutation({
		mutationKey: ['create-exchange', user],
		mutationFn: (data: ExchangeFormDataOutput) => {
			const idempotencyKey = key ?? createKey()

			return createExchangeServices.createExchange(data, idempotencyKey)
		},
		onSuccess() {
			toast.success('Обмен создан')

			queryClient.invalidateQueries({
				queryKey: ['exchanges']
			})
		},
		onError(error) {
			if (axios.isAxiosError(error)) {
				toast.error(error.response?.data.error)
			} else {
				toast.error(error.message)
			}
		}
	})

	return { createExchange, isPending }
}
