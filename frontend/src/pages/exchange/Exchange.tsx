import { ExchangeForm } from '@features/exchange-form/ui/ExchangeForm'

import styles from './Exchange.module.scss'

const Exchange = () => {
	const titleId = 'exchange-title'

	return (
		<section className={styles.content} aria-labelledby={titleId}>
			<h1 id={titleId} className='visually-hidden'>
				Страница обмена
			</h1>

			<ExchangeForm />
		</section>
	)
}

export { Exchange }
