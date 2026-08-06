import { ExchangeForm } from '@features/exchange-form/ui/ExchangeForm'

import styles from './Exchange.module.scss'
import clsx from 'clsx'

const Exchange = () => {
	const titleId = 'exchange-title'

	return (
		<section className={styles.content} aria-labelledby={titleId}>
			<div className={clsx('container', styles.body)}>
				<h1 id={titleId} className='visually-hidden'>
					Страница обмена
				</h1>

				<ExchangeForm />
			</div>
		</section>
	)
}

export { Exchange }
