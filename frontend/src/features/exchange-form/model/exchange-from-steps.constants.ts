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
