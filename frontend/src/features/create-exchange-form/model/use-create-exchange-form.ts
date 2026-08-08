import { useEffect } from 'react'
import { useWatch } from 'react-hook-form'

import { DEFAULT_FORM_VALUES } from '@features/create-exchange-form'
import { useCreatExchange } from '@features/create-exchange-form/api/exchange.mutation'

import { useDebounce, useFormsBase } from '@shared/lib'

import { useExchangeStepFormStore } from '../model/create-exchange-form-step.store'
import {
	type ExchangeFormDataInput,
	type ExchangeFormDataOutput,
	exchangeFormSchema
} from '../model/create-exchange-form.schema'
import { useExchangeFormStore } from '../model/create-exchange-form.store'

export const useExchangeForm = () => {
	const { createExchange } = useCreatExchange()

	const clearKey = useExchangeFormStore(s => s.clearIdempotencyKey)

	const formData = useExchangeStepFormStore(state => state.data)
	const resetStorage = useExchangeStepFormStore(state => state.reset)
	const updateStorage = useExchangeStepFormStore(state => state.updateData)

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

	const debouncedFormValues = useDebounce<Partial<ExchangeFormDataInput>>(
		formValues as Partial<ExchangeFormDataInput>,
		500
	)

	useEffect(() => {
		updateStorage(debouncedFormValues)

		clearKey()
	}, [formValues, clearKey, debouncedFormValues, updateStorage])

	return form
}
