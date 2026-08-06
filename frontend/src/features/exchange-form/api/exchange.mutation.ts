import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { exchangeServices } from '@features/exchange-form/api/exchange.services'
import type { ExchangeFormDataOutput } from '@features/exchange-form/model/exchange-form.schema'
import { useExchangeFormStore } from '@features/exchange-form/model/exchange-form.store'

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
			console.log(error)

			toast.error(error.message)
		}
	})

	return { createExchange, isPending }
}
