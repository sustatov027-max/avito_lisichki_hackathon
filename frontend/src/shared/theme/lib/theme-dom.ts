import type { Theme, ThemeMode } from '../model/theme.types'

type ThemeState = {
	mode: ThemeMode
	theme: Theme
}

const getSystemMode = () =>
	window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

const getResolvedMode = (mode: ThemeMode) =>
	mode === 'system' ? getSystemMode() : mode

const getThemeName = (state: ThemeState) =>
	`${getResolvedMode(state.mode)}-${state.theme}`

const applyTheme = (state: ThemeState) => {
	document.documentElement.dataset.theme = getThemeName(state)
}

export { applyTheme, getResolvedMode }
