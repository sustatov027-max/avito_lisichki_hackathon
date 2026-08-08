import { ATTRIBUTES } from '@entities/categories/model/attributes.constants'

import type {
	ExchangeFormDataInput,
	ExchangeFormDataOutput
} from './create-exchange-form.schema'

type ItemAttributes = ExchangeFormDataInput['offered_item']['attributes']
type ItemKind = 'offered' | 'wanted'
type StoredAttribute = Record<string, unknown>

const isStoredAttribute = (value: unknown): value is StoredAttribute =>
	typeof value === 'object' && value !== null

const toOptionalNumber = (value: unknown) => {
	if (value === '' || value === null || value === undefined) return undefined

	const number = Number(value)
	return Number.isFinite(number) ? number : undefined
}

const normalizeCategoryAttributes = (
	categoryId: string,
	itemKind: ItemKind,
	storedAttributes: unknown
): ItemAttributes => {
	const stored = Array.isArray(storedAttributes)
		? storedAttributes.filter(isStoredAttribute)
		: []

	return ATTRIBUTES.filter(
		attribute => attribute.categoryId === categoryId
	).map(attribute => {
		const previous = stored.find(
			storedAttribute => storedAttribute.attribute_id === attribute.id
		)

		if (
			itemKind === 'offered' &&
			attribute.type === 'range' &&
			attribute.label === 'Память'
		) {
			return {
				attribute_id: attribute.id,
				value: toOptionalNumber(previous?.value)
			}
		}

		if (attribute.type === 'range') {
			return {
				attribute_id: attribute.id,
				min_value: toOptionalNumber(previous?.min_value),
				max_value: toOptionalNumber(previous?.max_value)
			}
		}

		if (attribute.type === 'multiple-select') {
			const values = Array.isArray(previous?.values)
				? previous.values.filter(
						(value): value is string =>
							typeof value === 'string' &&
							attribute.options.some(option => option.name === value)
					)
				: []

			return {
				attribute_id: attribute.id,
				values: values.length ? values : undefined
			}
		}

		const value =
			typeof previous?.value === 'string' &&
			attribute.options.some(option => option.name === previous.value)
				? previous.value
				: undefined

		return { attribute_id: attribute.id, value }
	})
}

const getCategoryDefaultAttributes = (
	categoryId: string,
	itemKind: ItemKind
): ItemAttributes => normalizeCategoryAttributes(categoryId, itemKind, [])

const serializeItemAttributes = (
	attributes: ExchangeFormDataOutput['offered_item']['attributes']
) =>
	attributes.map(attribute => ({
		...attribute,
		value:
			attribute.value === undefined ? undefined : String(attribute.value)
	}))

export const serializeExchangeFormData = (
	data: ExchangeFormDataOutput
): ExchangeFormDataOutput => {
	if (!data.offered_item || !data.wanted_item) return data

	return {
		...data,
		offered_item: {
			...data.offered_item,
			attributes: serializeItemAttributes(data.offered_item.attributes)
		},
		wanted_item: {
			...data.wanted_item,
			attributes: serializeItemAttributes(data.wanted_item.attributes)
		}
	}
}

export { getCategoryDefaultAttributes, normalizeCategoryAttributes }
