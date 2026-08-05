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
import { useExchangeFormStore } from '../model/exchange-form.store'

export const useExchangeForm = () => {
	const { createExchange } = useCreatExchange()

	const clearKey = useExchangeFormStore(s => s.clearIdempotencyKey)

	const formData = useExchangeStepFormStore(state => state.data)

	const form = useFormsBase<ExchangeFormDataInput, ExchangeFormDataOutput>({
		schema: exchangeFormSchema,
		defaultValues: formData ?? {
			user_id: '',
			city_name: '',
			delivery_enabled: false,

			offered_item: {
				title: '',
				category_id: undefined,
				attributes: []
			},

			wanted_item: {
				title_query: '',
				category_id: undefined,
				attributes: [],
				min_price: '',
				max_price: ''
			}
		},
		onSubmit: async data => {
			console.log(data)

			createExchange(data, {
				onSuccess: () => {
					form.reset()
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
