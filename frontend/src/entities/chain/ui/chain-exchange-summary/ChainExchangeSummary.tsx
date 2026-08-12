import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Package } from 'lucide-react'

import { useChainModalStore } from '@entities/chain/model/chain-modal.store'

import { formatPrice } from '@shared/lib'
import { Card } from '@shared/ui'

import styles from './ChainExchangeSummary.module.scss'
import type {
	ChainExchangeSummaryProps,
	ExchangeItemCardProps
} from './ChainExchangeSummary.types'

const ExchangeItemCard = (props: ExchangeItemCardProps) => {
	const { item, label } = props
	const shouldReduceMotion = useReducedMotion()
	const setActiveModal = useChainModalStore(state => state.setActiveModal)

	const onCardClick = () => {
		setActiveModal(item.id)
	}

	return (
		<motion.button
			type='button'
			className={styles.cardButton}
			onClick={onCardClick}
			aria-label={`${label}: ${item.title}. Открыть информацию о товаре`}
			whileHover={shouldReduceMotion ? undefined : { y: -2 }}
			whileTap={shouldReduceMotion ? undefined : { scale: 0.99 }}
		>
			<Card className={styles.card}>
				<div className={styles.preview} aria-hidden='true'>
					{item.photo ? (
						<img src={item.photo} alt='' />
					) : (
						<Package size={30} strokeWidth={1.6} />
					)}
				</div>

				<div className={styles.content}>
					<span className={styles.label}>{label}</span>
					<strong className={styles.title}>{item.title}</strong>
					<span className={styles.price}>
						{formatPrice(item.estimated_price)} ₽
					</span>
				</div>
			</Card>
		</motion.button>
	)
}

const ChainExchangeSummary = (props: ChainExchangeSummaryProps) => {
	const { summary } = props

	return (
		<section
			className={styles.summary}
			aria-labelledby='chain-exchange-summary'
		>
			<h2 id='chain-exchange-summary' className={styles.heading}>
				Ваш обмен
			</h2>

			<div className={styles.items}>
				<ExchangeItemCard item={summary.giving_item} label='Вы отдаёте' />

				<div className={styles.direction} aria-hidden='true'>
					<ArrowRight size={20} />
				</div>

				<ExchangeItemCard item={summary.receiving_item} label='Вы получаете' />
			</div>
		</section>
	)
}

export { ChainExchangeSummary }
