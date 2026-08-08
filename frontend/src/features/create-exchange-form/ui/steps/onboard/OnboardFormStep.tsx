import type { ExchangeFormComponentsProps } from '@features/create-exchange-form'

import { Checkbox, FormField, Input } from '@shared/ui'

const OnboardFormStep = (props: ExchangeFormComponentsProps) => {
	const { form } = props

	return (
		<>
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

export { OnboardFormStep }
