import { describe, expect, it } from 'vitest'

import { normalizePersistedExchangeFormData } from './create-exchange-form-step.store'
import { exchangeFormSchema } from './create-exchange-form.schema'

const ATTRIBUTE_IDS = {
	color: '00000000-0000-4000-8000-000000000001',
	phoneMemory: '00000000-0000-4000-8000-000000000002',
	condition: '00000000-0000-4000-8000-000000000003',
	laptopRam: '00000000-0000-4000-8000-000000000004',
	laptopStorage: '00000000-0000-4000-8000-000000000005',
	brand: '00000000-0000-4000-8000-000000000006',
	laptopColor: '00000000-0000-4000-8000-000000000007'
} as const

describe('normalizePersistedExchangeFormData', () => {
	it('migrates offered memory from the old format to an optional number', () => {
		const data = normalizePersistedExchangeFormData({
			offered_item: {
				category_id: '00000000-0000-0000-0000-000000000101',
				attributes: [
					{
						attribute_id: ATTRIBUTE_IDS.phoneMemory,
						value: '256',
						min_value: undefined,
						max_value: undefined
					}
				]
			}
		} as never)

		expect(data.offered_item?.attributes).toEqual([
			{ attribute_id: ATTRIBUTE_IDS.color, values: undefined },
			{ attribute_id: ATTRIBUTE_IDS.phoneMemory, value: 256 },
			{ attribute_id: ATTRIBUTE_IDS.condition, value: undefined }
		])
	})

	it('rebuilds wanted attributes according to their current category', () => {
		const data = normalizePersistedExchangeFormData({
			wanted_item: {
				category_id: '00000000-0000-0000-0000-000000000102',
				attributes: [
					{ attribute_id: ATTRIBUTE_IDS.laptopRam, min_value: '8', max_value: '32' },
					{ attribute_id: ATTRIBUTE_IDS.brand, min_value: '1', max_value: '2' }
				]
			}
		} as never)

		expect(data.wanted_item?.attributes).toEqual([
			{ attribute_id: ATTRIBUTE_IDS.laptopRam, min_value: 8, max_value: 32 },
			{ attribute_id: ATTRIBUTE_IDS.laptopStorage, min_value: undefined, max_value: undefined },
			{ attribute_id: ATTRIBUTE_IDS.brand, value: undefined },
			{ attribute_id: ATTRIBUTE_IDS.laptopColor, values: undefined }
		])
	})

	it('produces a valid form from a mixed persisted draft', () => {
		const data = normalizePersistedExchangeFormData({
			city_name: 'Москва',
			delivery_enabled: false,
			offered_item: {
				title: 'Телефон',
				estimated_price: '50000',
				category_id: '00000000-0000-0000-0000-000000000101',
				attributes: [
					{ attribute_id: ATTRIBUTE_IDS.color, value: undefined },
					{ attribute_id: ATTRIBUTE_IDS.phoneMemory, value: '256' },
					{ attribute_id: ATTRIBUTE_IDS.condition, min_value: undefined }
				]
			},
			wanted_item: {
				title_query: 'Ноутбук',
				category_id: '00000000-0000-0000-0000-000000000102',
				attributes: [
					{ attribute_id: ATTRIBUTE_IDS.laptopRam, min_value: '8', max_value: '32' },
					{ attribute_id: ATTRIBUTE_IDS.brand, min_value: undefined }
				],
				min_price: '10000',
				max_price: '100000',
				description: ''
			}
		} as never)

		expect(exchangeFormSchema.safeParse(data).success).toBe(true)
	})
})
