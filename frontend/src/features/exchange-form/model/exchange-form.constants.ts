import type { ExchangeFormDataInput } from './exchange-form.schema'

export const DEFAULT_FORM_VALUES: ExchangeFormDataInput = {
	user_id: '',
	city_name: '',
	delivery_enabled: false,
	offered_item: { title: '', category_id: '', attributes: [] },
	wanted_item: {
		title_query: '',
		category_id: '',
		attributes: [],
		min_price: '',
		max_price: ''
	}
} as const
