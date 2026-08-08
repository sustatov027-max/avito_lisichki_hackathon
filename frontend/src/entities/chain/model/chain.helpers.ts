import type { Chain } from './chain.types'

export const getChainById = (chainId: string, chains: Chain[] | null) => {
	if (!chains) return null

	return chains.find(chain => chain.chain_id === chainId)
}
