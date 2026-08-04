import type { ReactNode } from 'react'

import { ToastProvider } from '@shared/ui/toast'
import { TooltipProvider } from '@shared/ui/tooltip'

import { QueryProvider } from './query-provider'
import { ThemeProvider } from './theme-provider/ThemeProvider'

type AppProvidersProps = {
	children: ReactNode
}

const AppProviders = (props: AppProvidersProps) => {
	const { children } = props

	return (
		<ThemeProvider>
			<QueryProvider>
				<TooltipProvider>
					{children}
					<ToastProvider />
				</TooltipProvider>
			</QueryProvider>
		</ThemeProvider>
	)
}

export { AppProviders }
