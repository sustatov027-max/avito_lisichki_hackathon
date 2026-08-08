import { describe, expect, it } from 'vitest'

import { normalizePersistedExchangeFormData } from './create-exchange-form-step.store'
import { exchangeFormSchema } from './create-exchange-form.schema'

describe('normalizePersistedExchangeFormData', () => {
	it('migrates offered memory from the old format to an optional number', () => {
		const data = normalizePersistedExchangeFormData({
			offered_item: {
				category_id: '00000000-0000-0000-0000-000000000101',
				attributes: [
					{
						attribute_id: '2',
						value: '256',
						min_value: undefined,
						max_value: undefined
					}
				]
			}
		} as never)

		expect(data.offered_item?.attributes).toEqual([
			{ attribute_id: '1', values: undefined },
			{ attribute_id: '2', value: 256 },
			{ attribute_id: '3', value: undefined }
		])
	})

	it('rebuilds wanted attributes according to their current category', () => {
		const data = normalizePersistedExchangeFormData({
			wanted_item: {
				category_id: '00000000-0000-0000-0000-000000000102',
				attributes: [
					{ attribute_id: '10', min_value: '8', max_value: '32' },
					{ attribute_id: '12', min_value: '1', max_value: '2' }
				]
			}
		} as never)

		expect(data.wanted_item?.attributes).toEqual([
			{ attribute_id: '10', min_value: 8, max_value: 32 },
			{ attribute_id: '11', min_value: undefined, max_value: undefined },
			{ attribute_id: '12', value: undefined },
			{ attribute_id: '13', values: undefined }
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
					{ attribute_id: '1', value: undefined },
					{ attribute_id: '2', value: '256' },
					{ attribute_id: '3', min_value: undefined }
				]
			},
			wanted_item: {
				title_query: 'Ноутбук',
				category_id: '00000000-0000-0000-0000-000000000102',
				attributes: [
					{ attribute_id: '10', min_value: '8', max_value: '32' },
					{ attribute_id: '12', min_value: undefined }
				],
				min_price: '10000',
				max_price: '100000'
			}
		} as never)

		expect(exchangeFormSchema.safeParse(data).success).toBe(true)
	})
})
