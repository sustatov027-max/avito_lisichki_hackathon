import { EXCHAGES } from '@entities/exchange/model/exchange-mocks'
import { ExchangeCard } from '@entities/exchange/ui'

import { Section } from '@shared/ui/section'

import styles from './Exchanges.module.scss'

const Exchanges = () => {
	return (
		<Section title='Мои обмены' id='exchanges' containerClassName={styles.body}>
			<div className={styles.header}>
				<p className={styles.count}>{EXCHAGES.total} обмена</p>
			</div>
			<div className={styles.list}>
				{EXCHAGES.items.map(exchange => (
					<ExchangeCard key={exchange.offered_item_id} exchange={exchange} />
				))}
			</div>
		</Section>
	)
}

export { Exchanges }
