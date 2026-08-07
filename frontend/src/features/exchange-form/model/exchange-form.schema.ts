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

const attributeValueSchema = z.union([
	z
		.object({
			attribute_id: z.union(attributeIdLiterals),
			value: z.string().min(1, 'Укажите значение').optional()
		})
		.strict(),
	z
		.object({
			attribute_id: z.union(attributeIdLiterals),
			values: z
				.array(z.string().min(1))
				.min(1, 'Укажите хотя бы одно значение')
				.optional()
		})
		.strict(),
	z
		.object({
			attribute_id: z.union(attributeIdLiterals),
			min_value: optionalNumber,
			max_value: optionalNumber
		})
		.strict()
])

export type AttributeValue = z.output<typeof attributeValueSchema>

const attributeSchema = attributeValueSchema.superRefine((attribute, ctx) => {
	const definitions = ATTRIBUTES.filter(
		definition => definition.id === attribute.attribute_id
	)

	if ('value' in attribute || 'values' in attribute) {
		const values =
			'value' in attribute
				? [attribute.value]
				: 'values' in attribute
					? attribute.values
					: undefined
		const definition = definitions[0]

		if (!values) return

		for (const value of values.filter(
			(value): value is string => value !== undefined
		)) {
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
	const rangeAttribute = attribute as {
		min_value?: number
		max_value?: number
	}
	if (
		rangeAttribute.min_value === undefined ||
		rangeAttribute.max_value === undefined
	) {
		return
	}
	if (rangeAttribute.min_value > rangeAttribute.max_value) {
		ctx.addIssue({
			code: 'custom',
			message: 'Минимальное значение не может быть больше максимального',
			path: ['min_value']
		})
	}
	if (
		rangeAttribute.min_value < range.min ||
		rangeAttribute.max_value > range.max
	) {
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

const offeredAttributeSchema = z.union([
	z
		.object({
			attribute_id: z.union(attributeIdLiterals),
			value: z.number().optional()
		})
		.strict()
		.superRefine((attribute, ctx) => {
			const definition = ATTRIBUTES.find(
				definition => definition.id === attribute.attribute_id
			)

			if (definition?.type !== 'range' || definition.label !== 'Память') {
				ctx.addIssue({
					code: 'custom',
					message: 'Числовое value допустимо только для атрибута «Память»',
					path: ['value']
				})
				return
			}
		}),
	attributeSchema
])

const offeredItemSchema = z
	.object({
		title: z.string().min(1, 'Укажите название предлагаемого товара'),
		estimated_price: z.coerce
			.number()
			.nonnegative('Оценочная стоимость не может быть отрицательной')
			.min(1, 'Укажите оценочную стоимость товара'),
		category_id: categoryIdSchema,
		attributes: z.array(offeredAttributeSchema)
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
