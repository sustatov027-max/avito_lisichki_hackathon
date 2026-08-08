import { describe, expect, it } from 'vitest'

import { getCategoryDataFromUUID } from './categories.helpers'

describe('getCategoryDataFromUUID', () => {
	it('returns category by id', () => {
		expect(
			getCategoryDataFromUUID('00000000-0000-0000-0000-000000000101')
		).toMatchObject({
			name: 'Смартфоны'
		})
	})

	it('returns undefined for unknown id', () => {
		expect(getCategoryDataFromUUID('unknown')).toBeUndefined()
	})
})
