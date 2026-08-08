import clsx from 'clsx'
import {
	ArrowRight,
	CheckCircle2,
	Clock3,
	MapPin,
	Package,
	Truck
} from 'lucide-react'
import { Link } from 'react-router'

import { getCategoryDataFromUUID } from '@entities/categories/model/categories.helpers'

import { ROUTES } from '@shared/constants/routes'
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
	const { exchange } = props

	const category = getCategoryDataFromUUID(exchange.category_id)
	const desiredCategory = getCategoryDataFromUUID(
		exchange.desired_item.category_id
	)

	const content = (
		<div className={styles.content}>
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
					<span className={`${styles.status} ${styles[exchange.item_status]}`}>
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
					<span
						className={clsx(
							styles.chain,
							exchange.chain_info.has_chain && styles.chainConnected
						)}
					>
						{exchange.chain_info.has_chain ? (
							<CheckCircle2 size={18} aria-hidden='true' />
						) : (
							<Clock3 size={16} aria-hidden='true' />
						)}
						<span className={styles.chainText}>
							<strong className={styles.chainTitle}>
								{exchange.chain_info.has_chain
									? 'Есть цепочка обмена'
									: EXCHANGE_CHAIN_STATUS_LABELS[exchange.chain_info.status]}
							</strong>
							<span className={styles.chainHint}>
								{exchange.chain_info.has_chain
									? 'Нажмите, чтобы открыть цепочку'
									: 'Цепочка ещё формируется'}
								{exchange.chain_info.chain_length !== null &&
									` · ${exchange.chain_info.chain_length} шагов`}
							</span>
						</span>
					</span>
					<span className={styles.desiredCategory}>
						{desiredCategory?.name ?? 'Любая категория'}
					</span>
				</div>
			</div>
		</div>
	)

	return (
		<Card
			className={clsx(
				styles.card,
				exchange.chain_info.has_chain && styles.isLink
			)}
		>
			{exchange.chain_info.chain_id ? (
				<Link
					to={ROUTES.CHAIN_ID(exchange.chain_info.chain_id)}
					className={styles.link}
				>
					{content}
				</Link>
			) : (
				<article>{content}</article>
			)}
		</Card>
	)
}

export { ExchangeCard }
