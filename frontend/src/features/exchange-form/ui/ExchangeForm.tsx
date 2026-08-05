import { useFormState } from 'react-hook-form'

import { useExchangeForm } from '@features/exchange-form/lib/use-exchange-form'
import type {
	ExchangeFormDataInput,
	ExchangeFormDataOutput
} from '@features/exchange-form/model/exchange-form-schema'
import { useExchangeStepFormStore } from '@features/exchange-form/model/exchange-form-step.store'
import { ExchangeOfferedFormField } from '@features/exchange-form/ui/ExchangeOfferedFormField'
import { ExchangeWantedFormFields } from '@features/exchange-form/ui/ExchangeWantedFormFields'
import { StepsNavigation } from '@features/exchange-form/ui/StepsNavigation'

import { Form } from '@shared/ui'

import { EXCHANGE_STEPS } from '../model/exchange-from-steps.constants'

import { ExchangeFormFields } from './ExchangeFormFields'

const ExchangeForm = () => {
	const form = useExchangeForm()

	const formState = useFormState(form)

	console.log(formState.errors)

	const step = useExchangeStepFormStore(state => state.step)

	return (
		<Form<ExchangeFormDataInput, ExchangeFormDataOutput>
			form={form}
			onSubmit={form.onSubmit}
			title='Создать обмен'
		>
			{step === EXCHANGE_STEPS.ONBOARD && <ExchangeFormFields form={form} />}
			{step === EXCHANGE_STEPS.OFFERED && (
				<ExchangeOfferedFormField form={form} />
			)}
			{step === EXCHANGE_STEPS.WANTED && (
				<ExchangeWantedFormFields form={form} />
			)}

			<StepsNavigation form={form} />
		</Form>
	)
}

export { ExchangeForm }
