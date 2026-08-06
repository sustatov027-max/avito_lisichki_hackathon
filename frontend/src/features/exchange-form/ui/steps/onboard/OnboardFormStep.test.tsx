import { FormProvider, useForm } from 'react-hook-form'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { DEFAULT_FORM_VALUES } from '@features/exchange-form/model/exchange-form.config'
import type {
	ExchangeFormDataInput,
	ExchangeFormDataOutput
} from '@features/exchange-form/model/exchange-form.schema'

import { OnboardFormStep } from './OnboardFormStep'

const TestForm = () => {
	const form = useForm<ExchangeFormDataInput, unknown, ExchangeFormDataOutput>({ defaultValues: DEFAULT_FORM_VALUES })
	return (
		<FormProvider {...form}>
			<OnboardFormStep form={form} />
		</FormProvider>
	)
}

describe('OnboardFormStep', () => {
	it('renders required onboarding fields', () => {
		render(<TestForm />)

		expect(screen.getByLabelText(/ID/)).toBeInTheDocument()
		expect(screen.getByLabelText(/Город/)).toBeInTheDocument()
		expect(screen.getByLabelText('Возможна доставка')).toBeInTheDocument()
	})
})
