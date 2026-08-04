import { useCreatExchange } from '@features/exchange-form/api/exchange.mutation'

import { useFormsBase } from '@shared/lib/forms'

import {
	type ExchangeFormDataInput,
	type ExchangeFormDataOutput,
	exchangeFormSchema
} from '../model/exchange-form-schema'

export const useExchangeForm = () => {
	const { createExchange } = useCreatExchange()

	const form = useFormsBase<ExchangeFormDataInput, ExchangeFormDataOutput>({
		schema: exchangeFormSchema,
		defaultValues: {},
		onSubmit: async data => {
			console.log(data)
			createExchange(data)
		}
	})

	return form
}
