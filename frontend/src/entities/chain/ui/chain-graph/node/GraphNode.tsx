import { Handle, Position } from '@xyflow/react'
import clsx from 'clsx'
import { Package } from 'lucide-react'
import type { CSSProperties } from 'react'

import { Card } from '@shared/ui'

import styles from './GraphNode.module.scss'
import type { GraphNodeProps } from './GraphNode.types'

const GraphNode = (props: GraphNodeProps) => {
	const { data } = props

	const isSameSide = data.sourcePosition === data.targetPosition

	const getHandleStyle = (
		position: Position,
		isSource: boolean
	): CSSProperties => {
		if (!isSameSide) return {}

		const offset = isSource ? '65%' : '35%'

		return position === Position.Top || position === Position.Bottom
			? { left: offset }
			: { top: offset }
	}

	return (
		<button className={styles.button}>
			<Card className={styles.node}>
				<Handle
					className={styles.handle}
					type='target'
					position={data.targetPosition}
					style={getHandleStyle(data.targetPosition, false)}
				/>
				<Handle
					className={styles.handle}
					type='source'
					position={data.sourcePosition}
					style={getHandleStyle(data.sourcePosition, true)}
				/>

				<div className={styles.preview} aria-hidden='true'>
					{data.item.photo ? (
						<img src={data.item.photo} alt='' />
					) : (
						<Package size={32} strokeWidth={1.6} />
					)}
				</div>

				<div className={styles.info}>
					<div className={styles.title}>{data.item.title}</div>
					<div className={styles.userInfo}>
						<div className={styles.user}>{data.from_user.name}</div>
						<div
							className={clsx(
								styles.userStatus,
								data.is_accepted && styles.isAccepted
							)}
						>
							{data.is_accepted ? 'Согласился' : 'Думает'}
						</div>
					</div>
				</div>
			</Card>
		</button>
	)
}

export { GraphNode }
