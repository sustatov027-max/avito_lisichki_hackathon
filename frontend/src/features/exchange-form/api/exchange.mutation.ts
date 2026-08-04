import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { exchangeServices } from '@features/exchange-form/api/exchange.services'
import type { ExchangeFormDataOutput } from '@features/exchange-form/model/exchange-form-schema'

export const useCreatExchange = () => {
	const { mutate: createExchange, isPending } = useMutation({
		mutationKey: ['create-exchange'],
		mutationFn: (data: ExchangeFormDataOutput) =>
			exchangeServices.createExchange(data),
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
