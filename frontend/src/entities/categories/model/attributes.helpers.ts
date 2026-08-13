import { ATTRIBUTES } from './attributes.constants'

type AttributeValue = {
	attribute_id: string
	value?: string | number
	values?: string[]
	min_value?: unknown
	max_value?: unknown
}

const getOptionLabel = (attributeId: string, value: string | number) => {
	const attribute = ATTRIBUTES.find(item => item.id === attributeId)

	if (!attribute || !('options' in attribute)) return String(value)

	return (
		attribute.options.find(option => option.name === value)?.label ??
		String(value)
	)
}

const getAttributeDataFromUUID = (attributeValue: AttributeValue) => {
	const attribute = ATTRIBUTES.find(
		item => item.id === attributeValue.attribute_id
	)

	if (!attribute) return undefined

	if (attributeValue.value !== undefined) {
		return {
			label: attribute.label,
			value: getOptionLabel(attribute.id, attributeValue.value)
		}
	}

	if (attributeValue.values?.length) {
		return {
			label: attribute.label,
			value: attributeValue.values
				.map(value => getOptionLabel(attribute.id, value))
				.join(', ')
		}
	}

	if (
		attributeValue.min_value !== undefined ||
		attributeValue.max_value !== undefined
	) {
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
