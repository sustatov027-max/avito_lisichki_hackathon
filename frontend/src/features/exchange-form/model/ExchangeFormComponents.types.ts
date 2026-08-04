import type { UseFormReturn } from 'react-hook-form'

import type {
	ExchangeFormDataInput,
	ExchangeFormDataOutput
} from '@features/exchange-form/model/exchange-form-schema'

export type ExchangeFormComponentsProps = {
	form: UseFormReturn<ExchangeFormDataInput, unknown, ExchangeFormDataOutput>
}
