import { useFormState } from 'react-hook-form'

import { EXCHANGE_STEPS } from '@features/create-exchange-form'
import { useExchangeStepFormStore } from '@features/create-exchange-form/model/create-exchange-form-step.store'
import type {
	ExchangeFormDataInput,
	ExchangeFormDataOutput
} from '@features/create-exchange-form/model/create-exchange-form.schema'
import { useExchangeForm } from '@features/create-exchange-form/model/use-create-exchange-form'

import { Form } from '@shared/ui'

import { StepsNavigation } from '../navigation'
import { ConfirmFormStep } from '../steps/confirm'
import { OfferedFormStep } from '../steps/offered'
import { OnboardFormStep } from '../steps/onboard'
import { WantedFormStep } from '../steps/wanted'

const CreateExchangeForm = () => {
	const form = useExchangeForm()

	const step = useExchangeStepFormStore(state => state.step)
	const forwardStep = useExchangeStepFormStore(state => state.forwardStep)

	const fields = useFormState({ control: form.control })

	console.log(fields.errors)

	return (
		<Form<ExchangeFormDataInput, ExchangeFormDataOutput>
			form={form}
			onSubmit={form.onSubmit}
			title='Создать обмен'
			onKeyDown={event => {
				if (step !== EXCHANGE_STEPS.CONFIRM && event.key === 'Enter') {
					forwardStep()
				}
			}}
		>
			{step === EXCHANGE_STEPS.ONBOARD && <OnboardFormStep form={form} />}
			{step === EXCHANGE_STEPS.OFFERED && <OfferedFormStep form={form} />}
			{step === EXCHANGE_STEPS.WANTED && <WantedFormStep form={form} />}
			{step === EXCHANGE_STEPS.CONFIRM && <ConfirmFormStep form={form} />}

			<StepsNavigation form={form} />
		</Form>
	)
}

export { CreateExchangeForm }
