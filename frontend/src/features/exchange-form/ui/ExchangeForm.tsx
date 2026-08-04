import { useFormState } from 'react-hook-form'

import { useExchangeForm } from '@features/exchange-form/lib/use-exchange-form'
import type {
	ExchangeFormDataInput,
	ExchangeFormDataOutput
} from '@features/exchange-form/model/exchange-form-schema'
import { ExchangeOfferedFormField } from '@features/exchange-form/ui/ExchangeOfferedFormField'
import { ExchangeWantedFormFields } from '@features/exchange-form/ui/ExchangeWantedFormFields'

import { Button, Form } from '@shared/ui'

import { ExchangeFormFields } from './ExchangeFormFields'

const ExchangeForm = () => {
	const form = useExchangeForm()

	const formState = useFormState(form)

	console.log(formState.errors)

	return (
		<Form<ExchangeFormDataInput, ExchangeFormDataOutput>
			form={form}
			onSubmit={form.onSubmit}
			title='Создать обмен'
		>
			<ExchangeFormFields form={form} />

			<ExchangeOfferedFormField form={form} />

			<ExchangeWantedFormFields form={form} />

			<Button type='submit'>Отправить</Button>
		</Form>
	)
}

export { ExchangeForm }
