import { describe, expect, it } from 'vitest'

import { exchangeFormSchema } from './create-exchange-form.schema'

const ATTRIBUTE_IDS = {
	color: '00000000-0000-4000-8000-000000000001',
	phoneMemory: '00000000-0000-4000-8000-000000000002',
	condition: '00000000-0000-4000-8000-000000000003',
	laptopRam: '00000000-0000-4000-8000-000000000004',
	laptopStorage: '00000000-0000-4000-8000-000000000005',
	brand: '00000000-0000-4000-8000-000000000006'
} as const

const validData = {
	city_name: 'Москва',
	delivery_enabled: false,
	offered_item: {
		title: 'Телефон',
		estimated_price: '50000',
		category_id: '00000000-0000-0000-0000-000000000101',
		attributes: [{ attribute_id: ATTRIBUTE_IDS.condition, value: 'new' }]
	},
	wanted_item: {
		title_query: 'Ноутбук',
		category_id: '00000000-0000-0000-0000-000000000102',
		attributes: [{ attribute_id: ATTRIBUTE_IDS.brand, value: 'Apple' }],
		min_price: '10000',
		max_price: '100000',
		description: ''
	}
}

describe('exchangeFormSchema', () => {
	it('accepts valid form and coerces numeric values', () => {
		const result = exchangeFormSchema.safeParse(validData)

		expect(result.success).toBe(true)
		if (result.success)
			expect(result.data.offered_item.estimated_price).toBe(50000)
	})

	it('rejects reversed wanted price range', () => {
		const result = exchangeFormSchema.safeParse({
			...validData,
			wanted_item: {
				...validData.wanted_item,
				min_price: '100000',
				max_price: '10000'
			}
		})

		expect(result.success).toBe(false)
	})

	it('rejects an attribute from another category', () => {
		const result = exchangeFormSchema.safeParse({
			...validData,
			offered_item: {
				...validData.offered_item,
				attributes: [{ attribute_id: ATTRIBUTE_IDS.brand, value: 'Apple' }]
			}
		})

		expect(result.success).toBe(false)
	})

	it('rejects an invalid range', () => {
		const result = exchangeFormSchema.safeParse({
			...validData,
			wanted_item: {
				...validData.wanted_item,
				attributes: [{ attribute_id: ATTRIBUTE_IDS.laptopRam, min_value: 32, max_value: 8 }]
			}
		})

		expect(result.success).toBe(false)
	})

	it('accepts optional numeric memory for an offered item', () => {
		const withMemory = exchangeFormSchema.safeParse({
			...validData,
			offered_item: {
				...validData.offered_item,
				attributes: [{ attribute_id: ATTRIBUTE_IDS.phoneMemory, value: 256 }]
			}
		})
		const withoutMemory = exchangeFormSchema.safeParse({
			...validData,
			offered_item: {
				...validData.offered_item,
				attributes: [{ attribute_id: ATTRIBUTE_IDS.phoneMemory, value: undefined }]
			}
		})

		expect(withMemory.success).toBe(true)
		expect(withoutMemory.success).toBe(true)
	})

	it('strips stale fields left by a previous category', () => {
		const result = exchangeFormSchema.safeParse({
			...validData,
			offered_item: {
				...validData.offered_item,
				attributes: [
					{ attribute_id: ATTRIBUTE_IDS.color, min_value: 64 },
					{ attribute_id: ATTRIBUTE_IDS.phoneMemory, value: 256, min_value: 64 },
					{ attribute_id: ATTRIBUTE_IDS.condition, min_value: 64 }
				]
			},
			wanted_item: {
				...validData.wanted_item,
				attributes: [
					{ attribute_id: ATTRIBUTE_IDS.laptopRam, min_value: 8, value: 'old' },
					{ attribute_id: ATTRIBUTE_IDS.brand, min_value: 1 }
				]
			}
		})

		expect(result.success).toBe(true)
		if (!result.success) return

		expect(result.data.offered_item.attributes).toEqual([
			{ attribute_id: ATTRIBUTE_IDS.color, values: undefined },
			{ attribute_id: ATTRIBUTE_IDS.phoneMemory, value: '256' },
			{ attribute_id: ATTRIBUTE_IDS.condition, value: undefined }
		])
		expect(result.data.wanted_item.attributes).toEqual([
			{ attribute_id: ATTRIBUTE_IDS.laptopRam, min_value: 8, max_value: undefined },
			{ attribute_id: ATTRIBUTE_IDS.brand, value: undefined }
		])
	})
})
