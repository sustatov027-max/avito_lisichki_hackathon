import { createBrowserRouter, redirect } from 'react-router'

import { Chain } from '@pages/chain'
import { CreateExchange } from '@pages/create-exchange'
import { Exchanges } from '@pages/exchanges'

import { ROUTES } from '@shared/constants/routes'
import { useCurrentUserStore } from '@shared/model/current-user.store'

import { MainLayout, RootLayout } from '../layouts'

export const router = createBrowserRouter([
	{
		Component: RootLayout,
		children: [
			{
				path: ROUTES.ROOT,
				Component: MainLayout,
				children: [
					{
						index: true,
						loader: () => redirect(ROUTES.EXCHANGES)
					},
					{
						path: ROUTES.EXCHANGE,
						Component: CreateExchange
					},
					{
						path: ROUTES.EXCHANGES,
						Component: Exchanges
					},
					{
						path: ROUTES.CHAIN_ID(':chainId'),
						Component: Chain,
						loader: () => {
							const { user } = useCurrentUserStore.getState()

							if (!user) return redirect(ROUTES.ROOT)
						}
					}
				]
			}
		]
	}
])
