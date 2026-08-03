import { Theme } from '@radix-ui/themes'
import { useEffect, useLayoutEffect, useState } from 'react'

import { useThemeStore } from '@shared/theme'
import { applyTheme, getResolvedMode } from '@shared/theme/lib/theme-dom'

import type { ThemeProviderProps } from './ThemeProvider.types'

const ThemeProvider = (props: ThemeProviderProps) => {
	const { children } = props

	const theme = useThemeStore(s => s.theme)
	const mode = useThemeStore(s => s.mode)

	const [isDarkSystemMode, setIsDarkSystemMode] = useState(
		window.matchMedia('(prefers-color-scheme: dark)').matches
	)

	useEffect(() => {
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
		const handleSystemModeChange = (event: MediaQueryListEvent) => {
			setIsDarkSystemMode(event.matches)
		}

		mediaQuery.addEventListener('change', handleSystemModeChange)

		return () => {
			mediaQuery.removeEventListener('change', handleSystemModeChange)
		}
	}, [])

	const appearance = getResolvedMode(mode)

	useLayoutEffect(() => {
		applyTheme({ mode, theme })
	}, [theme, mode, isDarkSystemMode])

	return <Theme appearance={appearance}>{children}</Theme>
}

export { ThemeProvider }
