import type { ChainItem, ChainSummary } from '@entities/chain/model/chain.types'

export type ChainExchangeSummaryProps = {
	summary: ChainSummary
}

export type ExchangeItemCardProps = {
	item: ChainItem
	label: string
}
