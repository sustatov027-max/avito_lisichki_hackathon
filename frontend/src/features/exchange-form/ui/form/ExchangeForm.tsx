import { EXCHANGE_STEPS } from '@features/exchange-form'
import { useExchangeStepFormStore } from '@features/exchange-form/model/exchange-form-step.store'
import type {
	ExchangeFormDataInput,
	ExchangeFormDataOutput
} from '@features/exchange-form/model/exchange-form.schema'
import { useExchangeForm } from '@features/exchange-form/model/use-exchange-form'

import { Form } from '@shared/ui'

import { StepsNavigation } from '../navigation'
import { ConfirmFormStep } from '../steps/confirm'
import { OfferedFormStep } from '../steps/offered'
import { OnboardFormStep } from '../steps/onboard'
import { WantedFormStep } from '../steps/wanted'

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
			{step === EXCHANGE_STEPS.ONBOARD && <OnboardFormStep form={form} />}
			{step === EXCHANGE_STEPS.OFFERED && <OfferedFormStep form={form} />}
			{step === EXCHANGE_STEPS.WANTED && <WantedFormStep form={form} />}
			{step === EXCHANGE_STEPS.CONFIRM && <ConfirmFormStep form={form} />}

			<StepsNavigation form={form} />
		</Form>
	)
}

export { ExchangeForm }
