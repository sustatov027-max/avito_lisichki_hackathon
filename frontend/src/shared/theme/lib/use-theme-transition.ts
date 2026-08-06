import { flushSync } from 'react-dom'

import { useThemeStore } from '@shared/theme'
import type { Theme, ThemeMode } from '@shared/theme'

type TransitionPoint = {
	x: number
	y: number
}

type ViewTransitionDocument = Document & {
	startViewTransition: (updateCallback: () => void) => unknown
}

const supportsViewTransition = (
	documentObject: Document
): documentObject is ViewTransitionDocument =>
	'startViewTransition' in documentObject &&
	typeof documentObject.startViewTransition === 'function'

const getTransitionRadius = (point: TransitionPoint) => {
	const farthestX = Math.max(point.x, window.innerWidth - point.x)
	const farthestY = Math.max(point.y, window.innerHeight - point.y)

	return Math.hypot(farthestX, farthestY)
}

const getTransitionPoint = (
	element: HTMLElement,
	clientX: number,
	clientY: number
): TransitionPoint => {
	if (clientX !== 0 || clientY !== 0) {
		return { x: clientX, y: clientY }
	}

	const rect = element.getBoundingClientRect()

	return {
		x: rect.left + rect.width / 2,
		y: rect.top + rect.height / 2
	}
}

const useThemeTransition = () => {
	const mode = useThemeStore(state => state.mode)
	const setThemeMode = useThemeStore(state => state.setThemeMode)
	const setTheme = useThemeStore(state => state.setTheme)

	const changeThemeModeCircle = (
		element: HTMLElement,
		clientX: number,
		clientY: number
	) => {
		const nextMode: ThemeMode = mode === 'dark' ? 'light' : 'dark'
		const prefersReducedMotion = window.matchMedia(
			'(prefers-reduced-motion: reduce)'
		).matches
		const isTouchDevice = window.matchMedia(
			'(hover: none) and (pointer: coarse)'
		).matches

		if (
			prefersReducedMotion ||
			isTouchDevice ||
			!supportsViewTransition(document)
		) {
			setThemeMode(nextMode)
			return
		}

		const point = getTransitionPoint(element, clientX, clientY)
		const root = document.documentElement

		root.dataset.themeTransition = 'circle'

		root.style.setProperty('--theme-transition-x', `${point.x}px`)
		root.style.setProperty('--theme-transition-y', `${point.y}px`)
		root.style.setProperty(
			'--theme-transition-radius',
			`${getTransitionRadius(point)}px`
		)

		document.startViewTransition(() => {
			flushSync(() => {
				setThemeMode(nextMode)
			})
		})
	}

	const changeThemeModeSlide = (nextTheme: Theme) => {
		const prefersReducedMotion = window.matchMedia(
			'(prefers-reduced-motion: reduce)'
		).matches

		if (prefersReducedMotion || !supportsViewTransition(document)) {
			setTheme(nextTheme)
			return
		}

		document.documentElement.dataset.themeTransition = 'slide'

		document.startViewTransition(() => {
			flushSync(() => {
				setTheme(nextTheme)
			})
		})
	}

	return { changeThemeModeCircle, changeThemeModeSlide }
}

export { useThemeTransition }
