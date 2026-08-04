import z from 'zod'

import { ATTRIBUTES } from '@entities/categories/model/attributes.constants'
import { categoryIdSchema } from '@entities/categories/model/categories.schemas'

const attributeIdLiterals = ATTRIBUTES.map(attribute =>
	z.literal(attribute.id)
) as [z.ZodLiteral<number>, ...z.ZodLiteral<number>[]]

const attributeValueSchema = z.union([
	z.object({
		attribute_id: z.union(attributeIdLiterals),
		value: z.string().min(1, 'Укажите значение')
	}),
	z.object({
		attribute_id: z.union(attributeIdLiterals),
		values: z.array(z.string().min(1)).min(1, 'Укажите хотя бы одно значение')
	}),
	z.object({
		attribute_id: z.union(attributeIdLiterals),
		min_value: z.coerce.number(),
		max_value: z.coerce.number()
	})
])

const attributeSchema = attributeValueSchema.superRefine((attribute, ctx) => {
	const definitions = ATTRIBUTES.filter(
		definition => definition.id === attribute.attribute_id
	)

	if ('value' in attribute || 'values' in attribute) {
		const values = 'value' in attribute ? [attribute.value] : attribute.values
		const definition = definitions[0]

		for (const value of values) {
			if (
				!definitions.some(
					definition =>
						'options' in definition &&
						(
							definition.options.map(option => option.name) as readonly string[]
						).includes(value)
				)
			) {
				ctx.addIssue({
					code: 'custom',
					message: `Недопустимое значение для атрибута «${attribute.attribute_id}»`,
					path: ['values']
				})
			}
		}

		if (definition?.type === 'select' && !('value' in attribute)) {
			ctx.addIssue({
				code: 'custom',
				message: 'Для select нужно использовать поле value',
				path: ['value']
			})
		}
		if (definition?.type === 'multiple-select' && !('values' in attribute)) {
			ctx.addIssue({
				code: 'custom',
				message: 'Для multiple-select нужно использовать поле values',
				path: ['values']
			})
		}
		if (definition?.type === 'range') {
			ctx.addIssue({
				code: 'custom',
				message: 'Для range нужно использовать min_value и max_value',
				path: ['min_value']
			})
		}

		return
	}

	const rangeDefinitions = definitions.filter(
		(
			definition
		): definition is Extract<(typeof ATTRIBUTES)[number], { type: 'range' }> =>
			definition.type === 'range'
	)

	if (rangeDefinitions.length === 0) {
		ctx.addIssue({
			code: 'custom',
			message: 'Для этого атрибута нельзя указывать диапазон',
			path: ['min_value']
		})
		return
	}

	const range = rangeDefinitions[0]
	if (attribute.min_value > attribute.max_value) {
		ctx.addIssue({
			code: 'custom',
			message: 'Минимальное значение не может быть больше максимального',
			path: ['min_value']
		})
	}
	if (attribute.min_value < range.min || attribute.max_value > range.max) {
		ctx.addIssue({
			code: 'custom',
			message: `Значение должно быть в диапазоне от ${range.min} до ${range.max}`,
			path: ['min_value']
		})
	}
})

const validateCategoryAttributes = (
	categoryId: string,
	attribute: z.infer<typeof attributeValueSchema>
) => {
	const allowedAttributes = ATTRIBUTES.filter(
		attribute => attribute.categoryId === categoryId
	)

	return allowedAttributes.some(
		allowedAttribute => allowedAttribute.id === attribute.attribute_id
	)
}

const itemAttributesSchema = z.array(attributeSchema)

const offeredItemSchema = z
	.object({
		title: z.string().min(1, 'Укажите название предлагаемого товара'),
		category_id: categoryIdSchema,
		attributes: itemAttributesSchema
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
		attributes: itemAttributesSchema,
		min_price: z.coerce
			.number()
			.nonnegative('Цена не может быть отрицательной'),
		max_price: z.coerce.number().nonnegative('Цена не может быть отрицательной')
	})
	.refine(value => value.min_price <= value.max_price, {
		message: 'Минимальная цена не может быть больше максимальной',
		path: ['min_price']
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

export const exchangeFormSchema = z.object({
	user_id: z
		.string()
		.min(3, 'Должно быть минимум три символа')
		.max(150, 'Слишком длинный ID'),
	city_name: z
		.string()
		.min(3, 'Короткое название города')
		.max(150, 'Слишком длинное название города'),
	delivery_enabled: z.boolean(),
	offered_item: offeredItemSchema,
	wanted_item: wantedItemSchema
})

export type ExchangeFormDataInput = z.input<typeof exchangeFormSchema>
export type ExchangeFormDataOutput = z.output<typeof exchangeFormSchema>
