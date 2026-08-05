import { useEffect } from 'react'
import { useWatch } from 'react-hook-form'

import { useCreatExchange } from '@features/exchange-form/api/exchange.mutation'

import { useFormsBase } from '@shared/lib/forms'

import {
	type ExchangeFormDataInput,
	type ExchangeFormDataOutput,
	exchangeFormSchema
} from '../model/exchange-form-schema'
import { useExchangeStepFormStore } from '../model/exchange-form-step.store'
import { DEFAULT_FORM_VALUES } from '../model/exchange-form.constants'
import { useExchangeFormStore } from '../model/exchange-form.store'

export const useExchangeForm = () => {
	const { createExchange } = useCreatExchange()

	const clearKey = useExchangeFormStore(s => s.clearIdempotencyKey)

	const formData = useExchangeStepFormStore(state => state.data)
	const resetStorage = useExchangeStepFormStore(state => state.reset)

	const form = useFormsBase<ExchangeFormDataInput, ExchangeFormDataOutput>({
		schema: exchangeFormSchema,
		defaultValues: {
			...DEFAULT_FORM_VALUES,
			...formData,
			offered_item: {
				...DEFAULT_FORM_VALUES.offered_item,
				...formData.offered_item
			},
			wanted_item: {
				...DEFAULT_FORM_VALUES.wanted_item,
				...formData.wanted_item
			}
		},
		onSubmit: async data => {
			console.log(data)

			createExchange(data, {
				onSuccess: () => {
					resetStorage()
					form.reset(DEFAULT_FORM_VALUES)
					clearKey()
				}
			})
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
