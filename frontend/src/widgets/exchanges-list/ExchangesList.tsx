import { useEffect } from 'react'
import toast from 'react-hot-toast'

import { useExchanges } from '@entities/exchange'
import { sortExchangesByChain } from '@entities/exchange/model/exchange.helpers'
import { ExchangeCard } from '@entities/exchange/ui'

import { useCurrentUserStore } from '@shared/model/current-user.store'
import { Spinner } from '@shared/ui'

import styles from './ExchangesList.module.scss'

const ExchangesList = () => {
	const user = useCurrentUserStore(state => state.user)

	const { data, isLoading, errorMessage } = useExchanges()

	console.log(data)

	useEffect(() => {
		if (errorMessage) {
			toast.error(errorMessage)
		}
	}, [errorMessage])

	return isLoading ? (
		<Spinner />
	) : user ? (
		<>
			<div className={styles.header}>
				<p className={styles.count}>{data?.total} обмена</p>
			</div>
			<div className={styles.list}>
				{data &&
					sortExchangesByChain(data.items).map(exchange => (
						<ExchangeCard key={exchange?.offered_item_id} exchange={exchange} />
					))}
			</div>
		</>
	) : (
		<p className={styles.message}>Выберите пользователя</p>
	)
}

export { ExchangesList }
