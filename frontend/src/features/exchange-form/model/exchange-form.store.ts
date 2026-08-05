import { create } from 'zustand'

import type { ExchangeFormState } from './exchange-form.types'

export const useExchangeFormStore = create<ExchangeFormState>(set => ({
	idempotencyKey: null,

	createIdempotencyKey: () => {
		const key = crypto.randomUUID()

		set({
			idempotencyKey: key
		})

		return key
	},

	clearIdempotencyKey: () => {
		set({
			idempotencyKey: null
		})
	}
}))
