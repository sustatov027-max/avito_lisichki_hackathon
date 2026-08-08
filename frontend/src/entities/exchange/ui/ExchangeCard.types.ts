import type { ExchangeItem } from '../model/exchange.types'

export type ExchangeCardProps = {
	exchange: ExchangeItem
	onClick?: (exchange: ExchangeItem) => void
}
