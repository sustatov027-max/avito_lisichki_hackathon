import { ChainGraph } from '@entities/chain'

import styles from './ChainDetails.module.scss'
import type { ChainDetailsProps } from './ChainDetails.types'

const ChainDetails = (props: ChainDetailsProps) => {
	const { chain } = props

	return (
		<div className={styles.body}>{chain && <ChainGraph chain={chain} />}</div>
	)
}

export { ChainDetails }
