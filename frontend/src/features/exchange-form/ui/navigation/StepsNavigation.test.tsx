import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { DEFAULT_FORM_VALUES } from '@features/exchange-form/model/exchange-form.config'
import {
	type ExchangeFormDataInput,
	type ExchangeFormDataOutput,
	exchangeFormSchema
} from '@features/exchange-form/model/exchange-form.schema'
import { useExchangeStepFormStore } from '@features/exchange-form/model/exchange-form-step.store'
import { Input } from '@shared/ui'

import { StepsNavigation } from './StepsNavigation'

const NavigationTest = () => {
	const form = useForm<ExchangeFormDataInput, unknown, ExchangeFormDataOutput>({
		resolver: zodResolver(exchangeFormSchema),
		defaultValues: DEFAULT_FORM_VALUES,
		mode: 'onChange'
	})

	return (
		<FormProvider {...form}>
			<Input aria-label='Город' {...form.register('city_name')} />
			<StepsNavigation form={form} />
		</FormProvider>
	)
}

describe('StepsNavigation', () => {
	beforeEach(() => {
		useExchangeStepFormStore.getState().reset()
	})

	it('does not advance while the current step is invalid', async () => {
		render(<NavigationTest />)

		fireEvent.click(screen.getByRole('button', { name: /далее/i }))

		await waitFor(() => {
			expect(useExchangeStepFormStore.getState().step).toBe('onboard')
		})
	})

	it('advances after valid onboarding data', async () => {
		render(<NavigationTest />)
		const userId = screen.getByLabelText('ID')
		const city = screen.getByLabelText('Город')

		fireEvent.input(userId, { target: { value: 'user-123' } })
		fireEvent.input(city, { target: { value: 'Москва' } })
		fireEvent.click(screen.getByRole('button', { name: /далее/i }))

		await waitFor(() => {
			expect(useExchangeStepFormStore.getState().step).toBe('offered')
		})
	})
})
