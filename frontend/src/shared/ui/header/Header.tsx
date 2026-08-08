import clsx from 'clsx'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect } from 'react'

import { useOutside } from '@shared/lib/hooks/use-outside'

import styles from './Header.module.scss'
import type { HeaderProps } from './Header.types'

const Header = (props: HeaderProps) => {
	const {
		className,
		logo,
		navigation,
		actions,
		mobileMenu,
		isMenuOpen = false,
		onMenuOpenChange,
		...rest
	} = props
	const {
		ref: headerRef,
		isShow,
		setIsShow,
		isClickOutside
	} = useOutside<HTMLElement>(isMenuOpen)
	const shouldReduceMotion = useReducedMotion()

	useEffect(() => {
		setIsShow(isMenuOpen)
	}, [isMenuOpen, setIsShow])

	useEffect(() => {
		if (isClickOutside) onMenuOpenChange?.(false)
	}, [isClickOutside, onMenuOpenChange])

	return (
		<header
			ref={headerRef}
			className={clsx(styles.header, className)}
			{...rest}
		>
			<div className={styles.inner}>
				{logo && <div className={styles.logo}>{logo}</div>}
				{navigation && <nav className={styles.navigation}>{navigation}</nav>}
				{actions && <div className={styles.actions}>{actions}</div>}
				{mobileMenu && <div className={styles.mobileMenu}>{mobileMenu}</div>}
			</div>
			<AnimatePresence initial={false}>
				{navigation && isShow && (
					<motion.nav
						key='mobile-navigation'
						className={styles.mobileNavigation}
						initial={{ opacity: 0, y: -8, scale: 0.98 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: -8, scale: 0.98 }}
						transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
					>
						{navigation}
					</motion.nav>
				)}
			</AnimatePresence>
		</header>
	)
}

export { Header }
