export type Theme = 'default' | 'forest' | 'sunset' | 'ocean'
export type ThemeMode = 'light' | 'dark' | 'system'

export type ThemeStoreActions = {
	setTheme: (theme: Theme) => void
	setThemeMode: (themeMode: ThemeMode) => void
}

export type ThemeStoreState = {
	theme: Theme
	mode: ThemeMode
} & ThemeStoreActions
