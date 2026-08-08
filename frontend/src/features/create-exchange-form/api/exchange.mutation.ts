import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import toast from 'react-hot-toast'

import { exchangeServices } from '@features/create-exchange-form/api/exchange.services'
import type { ExchangeFormDataOutput } from '@features/create-exchange-form/model/create-exchange-form.schema'
import { useExchangeFormStore } from '@features/create-exchange-form/model/create-exchange-form.store'

export const useCreatExchange = () => {
	const createKey = useExchangeFormStore(s => s.createIdempotencyKey)
	const key = useExchangeFormStore(s => s.idempotencyKey)

	const { mutate: createExchange, isPending } = useMutation({
		mutationKey: ['create-exchange'],
		mutationFn: (data: ExchangeFormDataOutput) => {
			const idempotencyKey = key ?? createKey()

			return exchangeServices.createExchange(data, idempotencyKey)
		},
		onSuccess() {
			toast.success('Обмен создан')
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
