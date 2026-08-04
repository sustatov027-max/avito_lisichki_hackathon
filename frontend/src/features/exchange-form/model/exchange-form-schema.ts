import z from 'zod'

import { ATTRIBUTES } from '@entities/categories/model/attributes.constants'
import { categoryIdSchema } from '@entities/categories/model/categories.schemas'

const attributeIds = [
	...new Set(ATTRIBUTES.map(attribute => attribute.name))
] as [string, ...string[]]

const attributeSchema = z.union([
	z.object({
		attribute_id: z.enum(attributeIds),
		values: z.array(z.string().min(1)).min(1, 'Укажите хотя бы одно значение')
	}),
	z
		.object({
			attribute_id: z.enum(attributeIds),
			min_value: z.number(),
			max_value: z.number()
		})
		.refine(value => value.min_value <= value.max_value, {
			message: 'Минимальное значение не может быть больше максимального',
			path: ['min_value']
		})
])

const offeredItemSchema = z.object({
	title: z.string().min(1, 'Укажите название предлагаемого товара'),
	category_id: categoryIdSchema,
	attributes: z.array(attributeSchema)
})

const wantedItemSchema = z
	.object({
		title_query: z.string().min(1, 'Укажите название желаемого товара'),
		category_id: categoryIdSchema,
		attributes: z.array(attributeSchema),
		min_price: z.number().nonnegative('Цена не может быть отрицательной'),
		max_price: z.number().nonnegative('Цена не может быть отрицательной')
	})
	.refine(value => value.min_price <= value.max_price, {
		message: 'Минимальная цена не может быть больше максимальной',
		path: ['min_price']
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
