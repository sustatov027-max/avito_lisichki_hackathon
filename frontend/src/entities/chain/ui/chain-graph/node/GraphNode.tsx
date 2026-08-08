import { Handle, Position } from '@xyflow/react'
import type { CSSProperties } from 'react'

import styles from './GraphNode.module.scss'
import type { GraphNodeProps } from './GraphNode.types'

const GraphNode = (props: GraphNodeProps) => {
	const { data } = props
	const isSameSide = data.sourcePosition === data.targetPosition
	const getHandleStyle = (position: Position, isSource: boolean): CSSProperties => {
		if (!isSameSide) return {}

		const offset = isSource ? '65%' : '35%'

		return position === Position.Top || position === Position.Bottom ? { left: offset } : { top: offset }
	}

	return (
		<div className={styles.node}>
			<Handle
				className={styles.handle}
				type='target'
				position={data.targetPosition}
				style={getHandleStyle(data.targetPosition, false)}
			/>
			<div className={styles.title}>{data.item.title}</div>
			<div className={styles.user}>{data.from_user.name}</div>
			<Handle
				className={styles.handle}
				type='source'
				position={data.sourcePosition}
				style={getHandleStyle(data.sourcePosition, true)}
			/>
		</div>
	)
}

export { GraphNode }
