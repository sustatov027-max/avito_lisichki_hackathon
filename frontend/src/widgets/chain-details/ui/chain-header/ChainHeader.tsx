import { ChainStatus } from '@entities/chain/ui/chain-status/ChainStatus'
import { ChainTimer } from '@entities/chain/ui/chain-timer/ChainTimer'

import styles from './ChainHeader.module.scss'
import type { ChainHeaderProps } from './ChainHeader.types'

const ChainHeader = (props: ChainHeaderProps) => {
	const { chain } = props

	return (
		chain && (
			<div className={styles.header}>
				<ChainStatus status={chain.status} />
				<ChainTimer seconds={chain?.time_left_seconds} />
			</div>
		)
	)
}

export { ChainHeader }
