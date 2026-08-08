import { ExchangeForm } from '@features/exchange-form/ui/form/ExchangeForm'

import { Section } from '@shared/ui/section'

import styles from './Exchange.module.scss'

const Exchange = () => {
	return (
		<Section
			title='Страница обмена'
			id='exchange'
			isTitleHide
			containerClassName={styles.body}
		>
			<ExchangeForm />
		</Section>
	)
}

export { Exchange }
