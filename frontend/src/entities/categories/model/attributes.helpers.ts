import type { ExchangeFormDataInput } from '@features/exchange-form/model/exchange-form.schema'

import { ATTRIBUTES } from './attributes.constants'

type AttributeValue =
	ExchangeFormDataInput['offered_item']['attributes'][number]

const getOptionLabel = (attributeId: string, value: string) => {
	const attribute = ATTRIBUTES.find(item => item.id === attributeId)

	if (!attribute || !('options' in attribute)) return value

	return attribute.options.find(option => option.name === value)?.label ?? value
}

const getAttributeDataFromUUID = (attributeValue: AttributeValue) => {
	const attribute = ATTRIBUTES.find(
		item => item.id === attributeValue.attribute_id
	)

	if (!attribute) return undefined

	if ('value' in attributeValue && attributeValue.value) {
		return {
			label: attribute.label,
			value: getOptionLabel(attribute.id, attributeValue.value)
		}
	}

	if ('values' in attributeValue && attributeValue.values?.length) {
		return {
			label: attribute.label,
			value: attributeValue.values
				.map(value => getOptionLabel(attribute.id, value))
				.join(', ')
		}
	}

	if ('min_value' in attributeValue || 'max_value' in attributeValue) {
		const unit = ['Память', 'SSD', 'Оперативная память'].includes(
			attribute.label
		)
			? ' ГБ'
			: ''

		return {
			label: attribute.label,
			value: `${attributeValue.min_value ?? '—'} – ${attributeValue.max_value ?? '—'}${unit}`
		}
	}

	return undefined
}

export { getAttributeDataFromUUID }
