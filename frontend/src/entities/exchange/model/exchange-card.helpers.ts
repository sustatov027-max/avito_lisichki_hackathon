import type { ExchangeItem } from './exchange.types'

export const EXCHANGE_STATUS_LABELS: Record<
	ExchangeItem['item_status'],
	string
> = {
	active: 'В поиске',
	reserved: 'В цепочке'
}

export const EXCHANGE_CHAIN_STATUS_LABELS: Record<
	ExchangeItem['chain_info']['status'],
	string
> = {
	proposed: 'Предложен обмен',
	searching: 'Ищем совпадения',
	accepted: 'Обмен подтверждён'
}

export const formatExchangeDate = (date: string) =>
	new Intl.DateTimeFormat('ru-RU', {
		day: 'numeric',
		month: 'long',
		year: 'numeric'
	}).format(new Date(date))
