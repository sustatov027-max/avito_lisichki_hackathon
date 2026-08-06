import { Form } from '@shared/ui'

import { useExchangeForm } from '../lib/use-exchange-form'
import { useExchangeStepFormStore } from '../model/exchange-form-step.store'
import type {
	ExchangeFormDataInput,
	ExchangeFormDataOutput
} from '../model/exchange-form.schema'
import { EXCHANGE_STEPS } from '../model/exchange-from-steps.constants'

import { ExchangeConfirmFormStep } from './ExchangeConfirmFormStep'
import { ExchangeOfferedFormStep } from './ExchangeOfferedFormStep'
import { ExchangeOnboardFormStep } from './ExchangeOnboardFormStep'
import { ExchangeWantedFormStep } from './ExchangeWantedFormStep'
import { StepsNavigation } from './StepsNavigation'

const ExchangeForm = () => {
	const form = useExchangeForm()

	const step = useExchangeStepFormStore(state => state.step)

	console.log(form.getValues())

	return (
		<Form<ExchangeFormDataInput, ExchangeFormDataOutput>
			form={form}
			onSubmit={form.onSubmit}
			title='Создать обмен'
		>
			{step === EXCHANGE_STEPS.ONBOARD && (
				<ExchangeOnboardFormStep form={form} />
			)}
			{step === EXCHANGE_STEPS.OFFERED && (
				<ExchangeOfferedFormStep form={form} />
			)}
			{step === EXCHANGE_STEPS.WANTED && <ExchangeWantedFormStep form={form} />}
			{step === EXCHANGE_STEPS.CONFIRM && (
				<ExchangeConfirmFormStep form={form} />
			)}

			<StepsNavigation form={form} />
		</Form>
	)
}

export { ExchangeForm }
