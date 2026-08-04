import type { Theme, ThemeMode } from '../model/theme.types'

type ThemeItem = {
	theme: Theme
	mode: ThemeMode
	label: string
}

export const THEMES: ThemeItem[] = [
	{
		theme: 'default',
		mode: 'light',
		label: 'Default'
	},
	{
		theme: 'default',
		mode: 'dark',
		label: 'Default'
	},
	{
		theme: 'forest',
		mode: 'light',
		label: 'Forest'
	},
	{
		theme: 'forest',
		mode: 'dark',
		label: 'Forest'
	},
	{
		theme: 'sunset',
		mode: 'light',
		label: 'Sunset'
	},
	{
		theme: 'sunset',
		mode: 'dark',
		label: 'Sunset'
	},
	{
		theme: 'ocean',
		mode: 'light',
		label: 'Ocean'
	},
	{
		theme: 'ocean',
		mode: 'dark',
		label: 'Ocean'
	}
]
