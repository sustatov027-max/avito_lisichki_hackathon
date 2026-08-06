import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useExchangeFormStore } from './exchange-form.store'

describe('useExchangeFormStore', () => {
	beforeEach(() => {
		useExchangeFormStore.setState({ idempotencyKey: null })
	})

	it('creates and clears idempotency key', () => {
		vi.spyOn(crypto, 'randomUUID').mockReturnValue('00000000-0000-0000-0000-000000000001')

		expect(useExchangeFormStore.getState().createIdempotencyKey()).toBe(
			'00000000-0000-0000-0000-000000000001'
		)
		expect(useExchangeFormStore.getState().idempotencyKey).toBe(
			'00000000-0000-0000-0000-000000000001'
		)
		useExchangeFormStore.getState().clearIdempotencyKey()
		expect(useExchangeFormStore.getState().idempotencyKey).toBeNull()
	})
})
