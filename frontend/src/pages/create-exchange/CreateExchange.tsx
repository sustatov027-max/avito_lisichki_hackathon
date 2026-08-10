import { CreateExchangeForm } from '@features/create-exchange-form'

import { Section } from '@shared/ui/section'

import styles from './CreateExchange.module.scss'

const CreateExchange = () => {
	return (
		<Section
			title='Страница обмена'
			id='exchange'
			isTitleHide
			containerClassName={styles.body}
		>
			<CreateExchangeForm />
		</Section>
	)
}

export { CreateExchange }
