import clsx from 'clsx'

import { chainStatusLabels } from '@entities/chain/model/chain.constans'

import styles from './ChainStatus.module.scss'
import type { ChainStatusProps } from './ChainStatus.types'

const ChainStatus = (props: ChainStatusProps) => {
	const { status } = props

	return (
		<div className={clsx(styles.status, styles[status])}>
			<span className={styles.dot} aria-hidden='true' />
			<span>{chainStatusLabels[status]}</span>
		</div>
	)
}

export { ChainStatus }
