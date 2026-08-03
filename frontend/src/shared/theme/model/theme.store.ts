import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { ThemeStoreState } from '@shared/theme/model/theme.types'

import { applyTheme } from '../lib/theme-dom'

export const useThemeStore = create<ThemeStoreState>()(
	persist(
		set => ({
			theme: 'forest',
			mode: 'light',
			setTheme: theme => set({ theme }),
			setThemeMode: themeMode => set({ mode: themeMode })
		}),
		{
			name: 'theme',
			onRehydrateStorage: () => state => {
				if (state) {
					applyTheme(state)
				}
			}
		}
	)
)
