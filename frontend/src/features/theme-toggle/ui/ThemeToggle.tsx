import clsx from 'clsx'
import { Moon, Sun } from 'lucide-react'
import { forwardRef } from 'react'

import { useThemeStore } from '@shared/theme'

import { useThemeTransition } from '../../../shared/theme/lib/use-theme-transition'

import styles from './ThemeToggle.module.scss'
import type { ThemeToggleProps } from './ThemeToggle.types'

const ThemeToggle = forwardRef<HTMLButtonElement, ThemeToggleProps>(
	(props, ref) => {
		const { className, onClick, disabled, ...rest } = props

		const mode = useThemeStore(s => s.mode)
		const { changeThemeModeCircle } = useThemeTransition()

		const isDark = mode === 'dark'
		const nextMode = isDark ? 'light' : 'dark'
		const label = `Переключить на ${nextMode === 'dark' ? 'тёмную' : 'светлую'} тему`

		return (
			<button
				ref={ref}
				type='button'
				className={clsx(styles.toggle, className)}
				aria-label={label}
				aria-pressed={isDark}
				title={label}
				disabled={disabled}
				onClick={event => {
					changeThemeModeCircle(
						event.currentTarget,
						event.clientX,
						event.clientY
					)
					onClick?.(event)
				}}
				{...rest}
			>
				{isDark ? (
					<Sun size={18} strokeWidth={2} aria-hidden='true' />
				) : (
					<Moon size={18} strokeWidth={2} aria-hidden='true' />
				)}
			</button>
		)
	}
)

ThemeToggle.displayName = 'ThemeToggle'

export { ThemeToggle }
