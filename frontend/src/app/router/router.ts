import { createBrowserRouter } from 'react-router'

import { HomeLayout, RootLayout } from '../layouts'

export const router = createBrowserRouter([
	{
		Component: RootLayout,
		children: [
			{
				path: '/',
				Component: HomeLayout
			}
		]
	}
])
