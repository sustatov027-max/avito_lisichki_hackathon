import type { ChainDetailsProps } from '@widgets/chain-details/ChainDetails.types'
import { ChainHeader } from '@widgets/chain-details/ui/chain-header/ChainHeader'

import { AcceptButton, RejectButton } from '@features/chain-decision'

import { ChainGraph, useChain } from '@entities/chain'

import styles from './ChainDetails.module.scss'

const ChainDetails = (props: ChainDetailsProps) => {
	const { chainId } = props

	const { chain } = useChain(chainId)

	return (
		<div className={styles.details}>
			<ChainHeader chain={chain} />
			<div className={styles.body}>
				{chain && <ChainGraph chain={chain} />}

				<div className={styles.buttons}>
					<AcceptButton
						chainId={chainId}
						disabled={chain?.status === 'rejected'}
					/>
					<RejectButton
						chainId={chainId}
						disabled={chain?.status === 'rejected'}
					/>
				</div>
			</div>
		</div>
	)
}

export { ChainDetails }
