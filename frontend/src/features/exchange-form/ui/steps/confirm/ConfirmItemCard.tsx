import { motion } from 'framer-motion'
import { ChevronRight, PackageOpen } from 'lucide-react'

import { Card } from '@shared/ui'

import styles from '../../ExchangeForm.module.scss'

import type { ConfirmItemCardProps } from './ConfirmItemCard.types'

const ConfirmItemCard = (props: ConfirmItemCardProps) => {
	const { caption, title, category, onClick } = props

	return (
		<motion.button
			type='button'
			className={styles.cardButton}
			onClick={onClick}
			whileHover={{ y: -2 }}
			whileTap={{ scale: 0.99 }}
		>
			<Card className={styles.card}>
				<span className={styles.cardIcon}>
					<PackageOpen size={22} aria-hidden='true' />
				</span>
				<span className={styles.cardContent}>
					<span className={styles.cardCaption}>{caption}</span>
					<strong>{title || 'Товар не указан'}</strong>
					<span className={styles.cardCategory}>
						{category || 'Категория не выбрана'}
					</span>
				</span>
				<ChevronRight className={styles.cardArrow} aria-hidden='true' />
			</Card>
		</motion.button>
	)
}

export { ConfirmItemCard }
