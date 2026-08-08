import { describe, expect, it } from 'vitest'

import { getCategoryDefaultAttributes } from './create-exchange-form.helpers'

const SMARTPHONES_CATEGORY_ID = '00000000-0000-0000-0000-000000000101'

describe('getCategoryDefaultAttributes', () => {
	it('uses a single optional value for offered memory', () => {
		const attributes = getCategoryDefaultAttributes(
			SMARTPHONES_CATEGORY_ID,
			'offered'
		)

		expect(
			attributes.find(attribute => attribute.attribute_id === '2')
		).toEqual({
			attribute_id: '2',
			value: undefined
		})
	})

	it('uses a range for wanted memory', () => {
		const attributes = getCategoryDefaultAttributes(
			SMARTPHONES_CATEGORY_ID,
			'wanted'
		)

		expect(
			attributes.find(attribute => attribute.attribute_id === '2')
		).toEqual({
			attribute_id: '2',
			min_value: undefined,
			max_value: undefined
		})
	})
})
