import { Checkbox, FormField, Input } from '@shared/ui'

import type { ExchangeFormComponentsProps } from '../model/exchange-form.types'

const ExchangeOnboardFormStep = (props: ExchangeFormComponentsProps) => {
	const { form } = props

	return (
		<>
			<FormField label='ID' name='user_id' isRequired>
				<Input
					id='user_id'
					placeholder='q345Zxsd'
					{...form.register('user_id')}
				/>
			</FormField>
			<FormField label='Город' name='city_name' isRequired>
				<Input
					id='city_name'
					placeholder='Москва'
					{...form.register('city_name')}
				/>
			</FormField>
			<Checkbox
				id='delivery_enabled'
				{...form.register('delivery_enabled')}
				label='Возможна доставка'
			/>
		</>
	)
}

export { ExchangeOnboardFormStep }
