import type { ExchangeFormDataInput } from './exchange-form.schema'

export const EXCHANGE_STEPS = {
	ONBOARD: 'onboard',
	OFFERED: 'offered',
	WANTED: 'wanted',
	CONFIRM: 'confirm'
} as const

export const FIELDS_BY_STEPS = {
	[EXCHANGE_STEPS.ONBOARD]: ['user_id', 'city_name', 'delivery_enabled'],
	[EXCHANGE_STEPS.OFFERED]: [
		'offered_item.title',
		'offered_item.estimated_price',
		'offered_item.category_id',
		'offered_item.attributes'
	],
	[EXCHANGE_STEPS.WANTED]: [
		'wanted_item.title_query',
		'wanted_item.category_id',
		'wanted_item.attributes',
		'wanted_item.min_price',
		'wanted_item.max_price'
	],
	[EXCHANGE_STEPS.CONFIRM]: []
} as const

export const DEFAULT_FORM_VALUES: ExchangeFormDataInput = {
	user_id: '',
	city_name: '',
	delivery_enabled: false,
	offered_item: {
		title: '',
		estimated_price: '',
		category_id: '',
		attributes: []
	},
	wanted_item: {
		title_query: '',
		category_id: '',
		attributes: [],
		min_price: '',
		max_price: ''
	}
} as const
