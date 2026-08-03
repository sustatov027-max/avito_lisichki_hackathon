import type { ReactNode } from 'react'

import { ToastProvider } from '@shared/ui/toast'
import { TooltipProvider } from '@shared/ui/tooltip'

import { ThemeProvider } from './theme-provider/ThemeProvider'

type AppProvidersProps = {
	children: ReactNode
}

const AppProviders = (props: AppProvidersProps) => {
	const { children } = props

	return (
		<ThemeProvider>
			<TooltipProvider>
				{children}
				<ToastProvider />
			</TooltipProvider>
		</ThemeProvider>
	)
}

export { AppProviders }
