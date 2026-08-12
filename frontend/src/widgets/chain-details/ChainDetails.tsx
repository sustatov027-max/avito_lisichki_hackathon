import type { ChainDetailsProps } from '@widgets/chain-details/ChainDetails.types'

import { AcceptButton, RejectButton } from '@features/chain-decision'

import { ChainGraph } from '@entities/chain'

import styles from './ChainDetails.module.scss'

const ChainDetails = (props: ChainDetailsProps) => {
	const { chainId, chain } = props

	return (
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
	)
}

export { ChainDetails }
