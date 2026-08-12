import z from 'zod'

import { ATTRIBUTES } from '@entities/categories/model/attributes.constants'
import { categoryIdSchema } from '@entities/categories/model/categories.schemas'

const attributeIdLiterals = ATTRIBUTES.map(attribute =>
	z.literal(attribute.id)
) as [z.ZodLiteral<string>, ...z.ZodLiteral<string>[]]

const optionalNumber = z.preprocess(
	value =>
		value === '' || value === null || value === undefined ? undefined : value,
	z.coerce.number().optional()
)

const rawAttributeSchema = z.object({
	attribute_id: z.union(attributeIdLiterals),
	value: z.union([z.string(), z.number()]).optional(),
	values: z.array(z.string()).optional(),
	min_value: optionalNumber,
	max_value: optionalNumber
})

type ItemKind = 'offered' | 'wanted'
export type AttributeValue = {
	attribute_id: string
	value?: string | number
	values?: string[]
	min_value?: number
	max_value?: number
}

const normalizeAttribute = (
	attribute: z.output<typeof rawAttributeSchema>,
	itemKind: ItemKind
): AttributeValue => {
	const definition = ATTRIBUTES.find(
		definition => definition.id === attribute.attribute_id
	)

	if (itemKind === 'offered' && definition?.type === 'range') {
		const value = Number(attribute.value)

		return {
			attribute_id: attribute.attribute_id,
			value:
				attribute.value === undefined || !Number.isFinite(value)
					? undefined
					: value
		}
	}

	if (definition?.type === 'range') {
		return {
			attribute_id: attribute.attribute_id,
			min_value: attribute.min_value,
			max_value: attribute.max_value
		}
	}

	if (definition?.type === 'multiple-select') {
		return {
			attribute_id: attribute.attribute_id,
			values: attribute.values?.length ? attribute.values : undefined
		}
	}

	return {
		attribute_id: attribute.attribute_id,
		value: typeof attribute.value === 'string' ? attribute.value : undefined
	}
}

const createAttributeSchema = (itemKind: ItemKind) =>
	rawAttributeSchema
		.transform(attribute => normalizeAttribute(attribute, itemKind))
		.superRefine((attribute, ctx) => {
			const definition = ATTRIBUTES.find(
				definition => definition.id === attribute.attribute_id
			)

			if (!definition) return
			if (itemKind === 'offered' && definition.type === 'range') {
				return
			}

			if (definition.type === 'select' && typeof attribute.value === 'string') {
				if (
					!definition.options.some(option => option.name === attribute.value)
				) {
					ctx.addIssue({
						code: 'custom',
						message: `Недопустимое значение для атрибута «${attribute.attribute_id}»`,
						path: ['value']
					})
				}
				return
			}

			if (definition.type === 'multiple-select' && attribute.values) {
				for (const value of attribute.values) {
					if (!definition.options.some(option => option.name === value)) {
						ctx.addIssue({
							code: 'custom',
							message: `Недопустимое значение для атрибута «${attribute.attribute_id}»`,
							path: ['values']
						})
					}
				}
				return
			}

			if (definition.type !== 'range') return

			if (
				attribute.min_value !== undefined &&
				attribute.min_value < definition.min
			) {
				ctx.addIssue({
					code: 'custom',
					message: `Значение должно быть не меньше ${definition.min}`,
					path: ['min_value']
				})
			}
			if (
				attribute.max_value !== undefined &&
				attribute.max_value > definition.max
			) {
				ctx.addIssue({
					code: 'custom',
					message: `Значение должно быть не больше ${definition.max}`,
					path: ['max_value']
				})
			}
			if (
				attribute.min_value !== undefined &&
				attribute.max_value !== undefined &&
				attribute.min_value > attribute.max_value
			) {
				ctx.addIssue({
					code: 'custom',
					message: 'Минимальное значение не может быть больше максимального',
					path: ['min_value']
				})
			}
		})

const validateCategoryAttributes = (
	categoryId: string,
	attribute: z.input<typeof rawAttributeSchema>
) => {
	const allowedAttributes = ATTRIBUTES.filter(
		attribute => attribute.categoryId === categoryId
	)

	return allowedAttributes.some(
		allowedAttribute => allowedAttribute.id === attribute.attribute_id
	)
}

const offeredAttributeSchema = createAttributeSchema('offered')
const wantedAttributeSchema = createAttributeSchema('wanted')

const offeredItemSchema = z
	.object({
		title: z.string().min(1, 'Укажите название предлагаемого товара'),
		estimated_price: z.coerce
			.number()
			.nonnegative('Оценочная стоимость не может быть отрицательной')
			.min(1, 'Укажите оценочную стоимость товара'),
		category_id: categoryIdSchema,
		attributes: z.array(offeredAttributeSchema),
		description: z.string()
	})
	.superRefine((item, ctx) => {
		for (const [index, attribute] of item.attributes.entries()) {
			if (!validateCategoryAttributes(item.category_id, attribute)) {
				ctx.addIssue({
					code: 'custom',
					message: 'Атрибут не относится к выбранной категории',
					path: ['attributes', index, 'attribute_id']
				})
			}
		}
	})

const wantedItemSchema = z
	.object({
		title_query: z.string().min(1, 'Укажите название желаемого товара'),
		category_id: categoryIdSchema,
		attributes: z.array(wantedAttributeSchema),
		min_price: optionalNumber.refine(
			value => value === undefined || value >= 0,
			'Цена не может быть отрицательной'
		),
		max_price: optionalNumber.refine(
			value => value === undefined || value >= 0,
			'Цена не может быть отрицательной'
		)
	})
	.refine(
		value =>
			value.min_price === undefined ||
			value.max_price === undefined ||
			value.min_price <= value.max_price,
		{
			message: 'Минимальная цена не может быть больше максимальной',
			path: ['min_price']
		}
	)
	.superRefine((item, ctx) => {
		for (const [index, attribute] of item.attributes.entries()) {
			if (!validateCategoryAttributes(item.category_id, attribute)) {
				ctx.addIssue({
					code: 'custom',
					message: 'Атрибут не относится к выбранной категории',
					path: ['attributes', index, 'attribute_id']
				})
			}
		}
	})

const exchangeFormSchemaBase = z.object({
	city_name: z
		.string()
		.min(3, 'Короткое название города')
		.max(150, 'Слишком длинное название города'),
	delivery_enabled: z.boolean(),
	offered_item: offeredItemSchema,
	wanted_item: wantedItemSchema
})

const serializeAttributeValue = <T extends { value?: string | number }>(
	attribute: T
) =>
	attribute.value === undefined
		? attribute
		: { ...attribute, value: String(attribute.value) }

export const exchangeFormSchema = exchangeFormSchemaBase.transform(data => ({
	...data,
	offered_item: {
		...data.offered_item,
		attributes: data.offered_item.attributes.map(serializeAttributeValue)
	},
	wanted_item: {
		...data.wanted_item,
		attributes: data.wanted_item.attributes.map(serializeAttributeValue)
	}
}))

export type ExchangeFormDataInput = z.input<typeof exchangeFormSchema>
export type ExchangeFormDataOutput = z.output<typeof exchangeFormSchema>
