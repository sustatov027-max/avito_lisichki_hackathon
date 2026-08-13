import { Plus } from 'lucide-react'
import { useEffect } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router'

import { useExchanges } from '@entities/exchange'
import { sortExchangesByChain } from '@entities/exchange/model/exchange.helpers'
import { ExchangeCard } from '@entities/exchange/ui'

import { ROUTES } from '@shared/constants/routes'
import { useCurrentUserStore } from '@shared/model/current-user.store'
import { Button, Spinner } from '@shared/ui'

import styles from './ExchangesList.module.scss'

const ExchangesList = () => {
	const user = useCurrentUserStore(state => state.user)

	const { data, isLoading, errorMessage } = useExchanges()

	const navigate = useNavigate()

	const onRedirectToFormButtonClick = () => {
		navigate(ROUTES.EXCHANGE)
	}

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
				{data?.items?.length ? (
					sortExchangesByChain(data.items).map(exchange => (
						<ExchangeCard key={exchange?.offered_item_id} exchange={exchange} />
					))
				) : (
					<div className={styles.nonExchanges}>
						<p>У вас нет обменов</p>
						<Button variant='secondary' onClick={onRedirectToFormButtonClick}>
							<Plus size={20} /> Создать обмен
						</Button>
					</div>
				)}
			</div>
		</>
	) : (
		<p className={styles.message}>Выберите пользователя</p>
	)
}

export { ExchangesList }
