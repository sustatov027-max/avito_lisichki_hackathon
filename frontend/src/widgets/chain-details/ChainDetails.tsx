import type { ChainDetailsProps } from '@widgets/chain-details/ChainDetails.types'
import { ChainHeader } from '@widgets/chain-details/ui/chain-header/ChainHeader'

import { AcceptButton, RejectButton } from '@features/chain-decision'

import { ChainExchangeSummary, ChainGraph, useChain } from '@entities/chain'
import { getIsDecisionDisabled } from '@entities/chain/model/chain.helpers'

import styles from './ChainDetails.module.scss'

const ChainDetails = (props: ChainDetailsProps) => {
	const { chainId } = props

	const { chain } = useChain(chainId)

	const isDecisionDisabled = getIsDecisionDisabled(chain)
  
	return (
		<div className={styles.details}>
			<ChainHeader chain={chain} />
			{chain && (
				<div className={styles.body}>
					<ChainGraph chain={chain} />

					<aside className={styles.sidebar}>
						<ChainExchangeSummary summary={chain.my_summary} />

						<div className={styles.buttons}>
							<AcceptButton chainId={chainId} disabled={isDecisionDisabled} />
							<RejectButton chainId={chainId} disabled={isDecisionDisabled} />
						</div>
					</aside>
				</div>
			)}
		</div>
	)
}

export { ChainDetails }
