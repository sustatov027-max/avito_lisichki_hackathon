import { ExchangeForm } from '@features/exchange-form/ui/ExchangeForm'

import styles from './Exchange.module.scss'

const Exchange = () => {
	return (
		<div className={styles.root}>
			<ExchangeForm />
		</div>
	)
}

export { Exchange }
