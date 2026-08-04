import { createBrowserRouter } from 'react-router'

import { Exchange } from '@pages/exchange'

import { HomeLayout, RootLayout } from '../layouts'

import { ROUTES } from './routes'

export const router = createBrowserRouter([
	{
		Component: RootLayout,
		children: [
			{
				path: '/',
				Component: HomeLayout,
				children: [
					{
						path: ROUTES.EXCHANGE,
						Component: Exchange
					}
				]
			}
		]
	}
])
