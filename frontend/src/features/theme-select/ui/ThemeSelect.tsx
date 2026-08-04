'use client'

import clsx from 'clsx'
import { useRef } from 'react'

import { THEMES, useThemeStore } from '@shared/theme'
import { useThemeTransition } from '@shared/theme/lib/use-theme-transition'

import styles from './ThemeSelect.module.scss'

const ThemeSelect = () => {
	const { changeThemeModeSlide } = useThemeTransition()
	const selectedTheme = useThemeStore(state => state.theme)
	const buttonRefs = useRef<Array<HTMLButtonElement | null>>([])
	const themes = THEMES.filter(item => item.mode === 'dark')

	const handleKeyDown = (
		event: React.KeyboardEvent<HTMLButtonElement>,
		index: number
	) => {
		let nextIndex: number

		switch (event.key) {
			case 'ArrowDown':
			case 'ArrowRight':
				nextIndex = (index + 1) % themes.length
				break
			case 'ArrowUp':
			case 'ArrowLeft':
				nextIndex = (index - 1 + themes.length) % themes.length
				break
			case 'Home':
				nextIndex = 0
				break
			case 'End':
				nextIndex = themes.length - 1
				break
			default:
				return
		}

		event.preventDefault()
		buttonRefs.current[nextIndex]?.focus()
		changeThemeModeSlide(themes[nextIndex].theme)
	}

	return (
		<div className={styles.select}>
			{themes.map(({ theme, label }, index) => (
				<button
					key={theme}
					ref={element => {
						buttonRefs.current[index] = element
					}}
					className={styles.button}
					type='button'
					onClick={() => changeThemeModeSlide(theme)}
					onKeyDown={event => handleKeyDown(event, index)}
					aria-pressed={selectedTheme === theme}
					aria-label={`Выбрать тему ${label}`}
				>
					<span
						className={clsx(styles.circle, styles[theme])}
						aria-hidden='true'
					/>
					<span className={styles.label}>{label}</span>
				</button>
			))}
		</div>
	)
}

export { ThemeSelect }
