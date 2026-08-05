import type { UseFormReturn } from 'react-hook-form'

import type {
	ExchangeFormDataInput,
	ExchangeFormDataOutput
} from '@features/exchange-form/model/exchange-form-schema'

import type { EXCHANGE_STEPS } from './exchange-from-steps.constants'

export type ExchangeFormComponentsProps = {
	form: UseFormReturn<ExchangeFormDataInput, unknown, ExchangeFormDataOutput>
}

export type ExchangeFormState = {
	idempotencyKey: string | null

	createIdempotencyKey: () => string
	clearIdempotencyKey: () => void
}

export type ExchangeStep = (typeof EXCHANGE_STEPS)[keyof typeof EXCHANGE_STEPS]

export interface ExchangeFormStepState {
	step: ExchangeStep
	data: Partial<ExchangeFormDataInput>

	setStep: (step: ExchangeStep) => void
	updateData: (data: Partial<ExchangeFormDataInput>) => void
	reset: () => void
	forwardStep: () => void
	backStep: () => void
}
