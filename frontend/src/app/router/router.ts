import { createBrowserRouter, redirect } from 'react-router'

import { Exchange } from '@pages/exchange'
import { Exchanges } from '@pages/exchanges'

import { ROUTES } from '@shared/constants/routes'

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
						Component: Exchange
					},
					{
						path: ROUTES.EXCHANGES,
						Component: Exchanges
					}
				]
			}
		]
	}
])
