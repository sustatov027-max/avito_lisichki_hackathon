import { useFormState } from 'react-hook-form'

import { useExchangeForm } from '@features/exchange-form/lib/use-exchange-form'
import type {
	ExchangeFormDataInput,
	ExchangeFormDataOutput
} from '@features/exchange-form/model/exchange-form-schema'

import { Button, Form, FormField, Input } from '@shared/ui'

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
			<FormField label='ID' name='user_id' isRequired>
				<Input
					id='user_id'
					placeholder='q345Zxsd'
					{...form.register('user_id')}
				/>
			</FormField>
			<FormField label='Город' name='city_name' isRequired>
				<Input id='city_name' placeholder='Москва' />
			</FormField>

			<Button type='submit' variant='secondary'>
				Отправить
			</Button>
		</Form>
	)
}

export { ExchangeForm }
