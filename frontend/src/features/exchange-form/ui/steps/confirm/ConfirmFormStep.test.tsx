import { FormProvider, useForm } from 'react-hook-form'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { DEFAULT_FORM_VALUES, EXCHANGE_STEPS } from '@features/exchange-form/model/exchange-form.config'
import type {
	ExchangeFormDataInput,
	ExchangeFormDataOutput
} from '@features/exchange-form/model/exchange-form.schema'
import { useExchangeStepFormStore } from '@features/exchange-form/model/exchange-form-step.store'
import { TooltipProvider } from '@shared/ui'

import { ConfirmFormStep } from './ConfirmFormStep'

const TestForm = () => {
	const form = useForm<ExchangeFormDataInput, unknown, ExchangeFormDataOutput>({
		defaultValues: {
			...DEFAULT_FORM_VALUES,
			offered_item: { ...DEFAULT_FORM_VALUES.offered_item, title: 'Телефон', category_id: '00000000-0000-0000-0000-000000000101' },
			wanted_item: { ...DEFAULT_FORM_VALUES.wanted_item, title_query: 'Ноутбук', category_id: '00000000-0000-0000-0000-000000000102' }
		}
	})
	return <TooltipProvider><FormProvider {...form}><ConfirmFormStep form={form} /></FormProvider></TooltipProvider>
}

describe('ConfirmFormStep', () => {
	it('shows item details and allows editing offered item', async () => {
		useExchangeStepFormStore.getState().setStep(EXCHANGE_STEPS.CONFIRM)
		render(<TestForm />)

		fireEvent.click(screen.getByRole('button', { name: /телефон/i }))
		await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())
		expect(screen.getByRole('dialog')).toHaveTextContent('Смартфоны')

		fireEvent.click(screen.getByRole('button', { name: /изменить/i }))
		expect(useExchangeStepFormStore.getState().step).toBe(EXCHANGE_STEPS.OFFERED)
	})
})
