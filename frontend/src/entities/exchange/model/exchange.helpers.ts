import type { ExchangeItem } from './exchange.types'

export const sortExchangesByChain = (exchanges: ExchangeItem[]) =>
	[...exchanges].sort(
		(a, b) =>
			Number(b.chain_info.has_chain || Boolean(b.chain_info.chain_id)) -
			Number(a.chain_info.has_chain || Boolean(a.chain_info.chain_id))
	)
