import type { ChainDetailsProps } from '@widgets/chain-details/ChainDetails.types'
import { ChainHeader } from '@widgets/chain-details/ui/chain-header/ChainHeader'

import { AcceptButton, RejectButton } from '@features/chain-decision'

import { ChainGraph, useChain } from '@entities/chain'
import { getIsDecisionDisabled } from '@entities/chain/model/chain.helpers'

import styles from './ChainDetails.module.scss'

const ChainDetails = (props: ChainDetailsProps) => {
	const { chainId } = props

	const { chain } = useChain(chainId)

	const isDecisionDisabled = getIsDecisionDisabled(chain)

	return (
		<div className={styles.details}>
			<ChainHeader chain={chain} />
			<div className={styles.body}>
				{chain && <ChainGraph chain={chain} />}

				<div className={styles.buttons}>
					<AcceptButton chainId={chainId} disabled={isDecisionDisabled} />
					<RejectButton chainId={chainId} disabled={isDecisionDisabled} />
				</div>
			</div>
		</div>
	)
}

export { ChainDetails }
