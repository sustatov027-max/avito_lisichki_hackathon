import { useEffect } from 'react'
import { useWatch } from 'react-hook-form'

import { useCreatExchange } from '@features/exchange-form/api/exchange.mutation'
import { useExchangeFormStore } from '@features/exchange-form/model/exchange.store'

import { useFormsBase } from '@shared/lib/forms'

import {
	type ExchangeFormDataInput,
	type ExchangeFormDataOutput,
	exchangeFormSchema
} from '../model/exchange-form-schema'

export const useExchangeForm = () => {
	const { createExchange } = useCreatExchange()

	const clearKey = useExchangeFormStore(s => s.clearIdempotencyKey)

	const form = useFormsBase<ExchangeFormDataInput, ExchangeFormDataOutput>({
		schema: exchangeFormSchema,
		defaultValues: {},
		onSubmit: async data => {
			console.log(data)

			createExchange(data)
		}
	})

	const formValues = useWatch({
		control: form.control
	})

	useEffect(() => {
		console.log('key')

		clearKey()
	}, [formValues, clearKey])

	return form
}
