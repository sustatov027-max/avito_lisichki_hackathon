import clsx from 'clsx'
import { Info } from 'lucide-react'
import { useEffect, useState } from 'react'

import { getTimeFromSeconds } from '@shared/lib/utils/getTimeFromSeconds'
import { Tooltip, TooltipContent, TooltipTrigger } from '@shared/ui'

import styles from './ChainTimer.module.scss'
import type { ChainTimerProps } from './ChainTimer.types'

const ChainTimer = (props: ChainTimerProps) => {
	const { seconds } = props

	const [timeLeft, setTimeLeft] = useState(seconds)

	useEffect(() => {
		const timer = setInterval(() => {
			setTimeLeft(value => Math.max(value - 1, 0))
		}, 1000)

		return () => clearInterval(timer)
	}, [])

	const isExpired = timeLeft === 0

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<div
					className={clsx(styles.timer, isExpired && styles.isExpired)}
					aria-live='polite'
				>
					<Tooltip>
						<TooltipTrigger asChild>
							<div className={styles.infoIcon}>
								<Info size={16} opacity={0.5} />
							</div>
						</TooltipTrigger>
						<TooltipContent>Время до окончания обмена</TooltipContent>
					</Tooltip>
					<span className={styles.label}>
						{isExpired ? 'Срок истёк' : 'Осталось:'}
					</span>
					{!isExpired && (
						<strong className={styles.value}>
							{getTimeFromSeconds(timeLeft)}
						</strong>
					)}
				</div>
			</TooltipTrigger>
		</Tooltip>
	)
}

export { ChainTimer }
