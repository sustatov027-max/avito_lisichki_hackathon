import {
	ArrowRight,
	CheckCircle2,
	Clock3,
	MapPin,
	Package,
	Truck
} from 'lucide-react'

import { getCategoryDataFromUUID } from '@entities/categories/model/categories.helpers'

import { Card } from '@shared/ui'

import {
	EXCHANGE_CHAIN_STATUS_LABELS,
	EXCHANGE_STATUS_LABELS,
	formatExchangeDate,
	formatExchangePrice
} from '../model/exchange-card.helpers'

import styles from './ExchangeCard.module.scss'
import type { ExchangeCardProps } from './ExchangeCard.types'

const ExchangeCard = (props: ExchangeCardProps) => {
	const { exchange, onClick } = props
	const category = getCategoryDataFromUUID(exchange.category_id)
	const desiredCategory = getCategoryDataFromUUID(
		exchange.desired_item.category_id
	)
	const Component = onClick ? 'button' : 'article'

	return (
		<Card className={styles.card}>
			<Component
				className={styles.content}
				type={onClick ? 'button' : undefined}
				onClick={onClick ? () => onClick(exchange) : undefined}
			>
				<div className={styles.preview} aria-hidden='true'>
					{exchange.photos[0] ? (
						<img src={exchange.photos[0]} alt='' />
					) : (
						<Package size={32} strokeWidth={1.6} />
					)}
				</div>

				<div className={styles.main}>
					<div className={styles.topline}>
						<span className={styles.category}>{category?.name ?? 'Товар'}</span>
						<span
							className={`${styles.status} ${styles[exchange.item_status]}`}
						>
							{EXCHANGE_STATUS_LABELS[exchange.item_status]}
						</span>
					</div>

					<h2 className={styles.title}>{exchange.title}</h2>

					<div className={styles.meta}>
						<span>
							<MapPin size={15} aria-hidden='true' />
							{exchange.city_name}
						</span>
						<span>
							<Clock3 size={15} aria-hidden='true' />
							{formatExchangeDate(exchange.created_at)}
						</span>
						{exchange.delivery_enabled && (
							<span>
								<Truck size={15} aria-hidden='true' /> Доставка
							</span>
						)}
					</div>

					<div className={styles.exchange}>
						<div>
							<span className={styles.label}>Предлагаю</span>
							<strong>{formatExchangePrice(exchange.estimated_price)} ₽</strong>
						</div>
						<ArrowRight className={styles.arrow} size={20} aria-hidden='true' />
						<div>
							<span className={styles.label}>Хочу получить</span>
							<strong>{exchange.desired_item.title_pattern}</strong>
							<span className={styles.range}>
								{formatExchangePrice(exchange.desired_item.min_price)}–
								{formatExchangePrice(exchange.desired_item.max_price)} ₽
							</span>
						</div>
					</div>

					<div className={styles.bottomline}>
						<span className={styles.chain}>
							{exchange.chain_info.has_chain ? (
								<CheckCircle2 size={16} aria-hidden='true' />
							) : (
								<Clock3 size={16} aria-hidden='true' />
							)}
							{EXCHANGE_CHAIN_STATUS_LABELS[exchange.chain_info.status]}
							{exchange.chain_info.chain_length !== null &&
								` · ${exchange.chain_info.chain_length} шага`}
						</span>
						<span className={styles.desiredCategory}>
							{desiredCategory?.name ?? 'Любая категория'}
						</span>
					</div>
				</div>
			</Component>
		</Card>
	)
}

export { ExchangeCard }
