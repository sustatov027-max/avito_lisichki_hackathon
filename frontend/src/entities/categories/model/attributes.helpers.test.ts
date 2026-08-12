import { describe, expect, it } from 'vitest'

import { getAttributeDataFromUUID } from './attributes.helpers'

const ATTRIBUTE_IDS = {
	color: '00000000-0000-4000-8000-000000000001',
	phoneMemory: '00000000-0000-4000-8000-000000000002',
	condition: '00000000-0000-4000-8000-000000000003'
} as const

describe('getAttributeDataFromUUID', () => {
	it('formats select value', () => {
		expect(
			getAttributeDataFromUUID({
				attribute_id: ATTRIBUTE_IDS.condition,
				value: 'new'
			})
		).toEqual({
			label: 'Состояние',
			value: 'Новое'
		})
	})

	it('formats multiple values', () => {
		expect(
			getAttributeDataFromUUID({
				attribute_id: ATTRIBUTE_IDS.color,
				values: ['black', 'white']
			})
		).toEqual({
			label: 'Цвет',
			value: 'Черный, Белый'
		})
	})

	it('formats range with units', () => {
		expect(
			getAttributeDataFromUUID({
				attribute_id: ATTRIBUTE_IDS.phoneMemory,
				min_value: 64,
				max_value: 256
			})
		).toEqual({
			label: 'Память',
			value: '64 – 256 ГБ'
		})
	})

	it('returns undefined for unknown attribute', () => {
		expect(
			getAttributeDataFromUUID({ attribute_id: 'unknown', value: 'x' })
		).toBeUndefined()
	})
})
