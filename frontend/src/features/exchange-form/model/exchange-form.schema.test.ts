import { describe, expect, it } from 'vitest'

import { exchangeFormSchema } from './exchange-form.schema'

const validData = {
	user_id: 'user-123',
	city_name: 'Москва',
	delivery_enabled: false,
	offered_item: {
		title: 'Телефон',
		estimated_price: '50000',
		category_id: '00000000-0000-0000-0000-000000000101',
		attributes: [{ attribute_id: '3', value: 'new' }]
	},
	wanted_item: {
		title_query: 'Ноутбук',
		category_id: '00000000-0000-0000-0000-000000000102',
		attributes: [{ attribute_id: '12', value: 'Apple' }],
		min_price: '10000',
		max_price: '100000'
	}
}

describe('exchangeFormSchema', () => {
	it('accepts valid form and coerces numeric values', () => {
		const result = exchangeFormSchema.safeParse(validData)

		expect(result.success).toBe(true)
		if (result.success) expect(result.data.offered_item.estimated_price).toBe(50000)
	})

	it('rejects reversed wanted price range', () => {
		const result = exchangeFormSchema.safeParse({
			...validData,
			wanted_item: { ...validData.wanted_item, min_price: '100000', max_price: '10000' }
		})

		expect(result.success).toBe(false)
	})

	it('rejects an attribute from another category', () => {
		const result = exchangeFormSchema.safeParse({
			...validData,
			offered_item: { ...validData.offered_item, attributes: [{ attribute_id: '12', value: 'Apple' }] }
		})

		expect(result.success).toBe(false)
	})

	it('rejects an invalid range', () => {
		const result = exchangeFormSchema.safeParse({
			...validData,
			offered_item: { ...validData.offered_item, attributes: [{ attribute_id: '2', min_value: 500, max_value: 100 }] }
		})

		expect(result.success).toBe(false)
	})
})
