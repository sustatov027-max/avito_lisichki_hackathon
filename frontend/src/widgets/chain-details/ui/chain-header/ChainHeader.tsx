import { ChainStatus } from '@entities/chain/ui/chain-status/ChainStatus'
import { ChainTimer } from '@entities/chain/ui/chain-timer/ChainTimer'

import styles from './ChainHeader.module.scss'
import type { ChainHeaderProps } from './ChainHeader.types'

const ChainHeader = (props: ChainHeaderProps) => {
	const { chain } = props

	if (!chain) {
		return null
	}

	const decisionLabels = {
		pending: 'Решение не принято',
		accepted: 'Вы приняли цепочку',
		rejected: 'Вы отклонили цепочку'
	} as const

	return (
		<div className={styles.header}>
			<div className={styles.info}>
				<ChainStatus status={chain.status} />
				<p
					className={
						chain.my_summary.user_action_required
							? styles.actionRequired
							: styles.decision
					}
				>
					{chain.my_summary.user_action_required
						? 'Требуется ваше решение'
						: decisionLabels[chain.my_summary.my_decision]}
				</p>
			</div>

			<ChainTimer seconds={chain.time_left_seconds} />
		</div>
	)
}

export { ChainHeader }
