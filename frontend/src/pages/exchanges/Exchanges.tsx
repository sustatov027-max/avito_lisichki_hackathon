import { ExchangesList } from '@widgets/exchanges-list/ExchangesList'

import { Section } from '@shared/ui/section'

import styles from './Exchanges.module.scss'

const Exchanges = () => {
	return (
		<Section title='Мои обмены' id='exchanges' containerClassName={styles.body}>
			<ExchangesList />
		</Section>
	)
}

export { Exchanges }
