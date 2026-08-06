import { motion } from 'framer-motion'
import { ChevronRight, PackageOpen, Pencil } from 'lucide-react'
import { useState } from 'react'

import { getAttributeDataFromUUID } from '@entities/categories/model/attributes.helpers'
import { getCategoryDataFromUUID } from '@entities/categories/model/categories.helpers'

import { Button, Card, FormSection, Modal } from '@shared/ui'

import { useExchangeStepFormStore } from '../model/exchange-form-step.store'
import type { ExchangeFormComponentsProps } from '../model/exchange-form.types'
import { EXCHANGE_STEPS } from '../model/exchange-from-steps.constants'

import styles from './ExchangeForm.module.scss'

type ItemType = 'offered' | 'wanted'

type ConfirmItemCardProps = {
	caption: string
	title: string
	category?: string
	onClick: () => void
}

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

const ExchangeConfirmFormStep = (props: ExchangeFormComponentsProps) => {
	const { form } = props

	const data = form.getValues()

	const [activeItemType, setActiveItemType] = useState<ItemType | null>(null)

	const setStep = useExchangeStepFormStore(state => state.setStep)

	const isOffered = activeItemType === 'offered'

	const item = isOffered ? data.offered_item : data.wanted_item
	const itemTitle = isOffered
		? data.offered_item.title
		: data.wanted_item.title_query

	const category = getCategoryDataFromUUID(item.category_id)
	const attributes = item.attributes
		.map(getAttributeDataFromUUID)
		.filter((attribute): attribute is NonNullable<typeof attribute> =>
			Boolean(attribute)
		)

	const closeModal = () => setActiveItemType(null)
	const onEditButtonClick = () => {
		setStep(isOffered ? EXCHANGE_STEPS.OFFERED : EXCHANGE_STEPS.WANTED)
		closeModal()
	}

	return (
		<FormSection
			title='Результат'
			description='Проверьте параметры обмена перед публикацией'
			className={styles.cards}
		>
			<ConfirmItemCard
				caption='Вы отдаёте'
				title={data.offered_item.title}
				category={getCategoryDataFromUUID(data.offered_item.category_id)?.name}
				onClick={() => setActiveItemType('offered')}
			/>
			<ConfirmItemCard
				caption='Вы получаете'
				title={data.wanted_item.title_query}
				category={getCategoryDataFromUUID(data.wanted_item.category_id)?.name}
				onClick={() => setActiveItemType('wanted')}
			/>
			<Modal
				open={activeItemType !== null}
				onClose={closeModal}
				title={itemTitle || 'Товар не указан'}
				description={
					isOffered ? 'Вы отдаёте этот товар' : 'Вы хотите получить этот товар'
				}
				size='lg'
				className={styles.detailsModal}
			>
				<section className={styles.modalIntro} aria-labelledby='item-main-info'>
					<h3 id='item-main-info'>Основная информация</h3>
					<dl>
						<div>
							<dt>Категория</dt>
							<dd>{category?.name || 'Не выбрана'}</dd>
						</div>
						{!isOffered && (
							<div>
								<dt>Диапазон цены</dt>
								<dd>
									{String(data.wanted_item.min_price || '—')} –{' '}
									{String(data.wanted_item.max_price || '—')} ₽
								</dd>
							</div>
						)}
					</dl>
				</section>
				<section
					className={styles.attributes}
					aria-labelledby='item-attributes'
				>
					<h3 id='item-attributes'>Характеристики</h3>
					{attributes.length ? (
						<dl>
							{attributes.map(attribute => (
								<div key={attribute.label}>
									<dt>{attribute.label}</dt>
									<dd>{attribute.value}</dd>
								</div>
							))}
						</dl>
					) : (
						<p>Характеристики не указаны</p>
					)}
				</section>
				<footer className={styles.modalFooter}>
					<Button type='button' variant='secondary' onClick={onEditButtonClick}>
						<Pencil size={18} aria-hidden='true' /> Изменить
					</Button>
				</footer>
			</Modal>
		</FormSection>
	)
}

export { ExchangeConfirmFormStep }
