import { describe, expect, it } from 'vitest'

import { getAttributeDataFromUUID } from './attributes.helpers'

describe('getAttributeDataFromUUID', () => {
	it('formats select value', () => {
		expect(getAttributeDataFromUUID({ attribute_id: '3', value: 'new' })).toEqual({
			label: 'Состояние',
			value: 'Новое'
		})
	})

	it('formats multiple values', () => {
		expect(getAttributeDataFromUUID({ attribute_id: '1', values: ['black', 'white'] })).toEqual({
			label: 'Цвет',
			value: 'Черный, Белый'
		})
	})

	it('formats range with units', () => {
		expect(getAttributeDataFromUUID({ attribute_id: '2', min_value: 64, max_value: 256 })).toEqual({
			label: 'Память',
			value: '64 – 256 ГБ'
		})
	})

	it('returns undefined for unknown attribute', () => {
		expect(getAttributeDataFromUUID({ attribute_id: 'unknown', value: 'x' })).toBeUndefined()
	})
})
