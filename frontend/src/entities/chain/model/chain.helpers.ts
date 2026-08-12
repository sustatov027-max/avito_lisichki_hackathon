import { terminalStatuses } from './chain.constans'
import type { Chain } from './chain.types'

export const getChainById = (chainId: string, chains: Chain[] | null) => {
	if (!chains) return null

	return chains.find(chain => chain.chain_id === chainId)
}

export const getIsDecisionDisabled = (chain?: Chain) =>
	!chain ||
	terminalStatuses.includes(chain.status) ||
	!chain.my_summary.user_action_required ||
	chain.my_summary.my_decision !== 'pending' ||
	chain.time_left_seconds <= 0
