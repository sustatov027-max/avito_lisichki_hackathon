import type { HTMLAttributes, ReactNode } from 'react'

export type HeaderProps = Omit<HTMLAttributes<HTMLElement>, 'children'> & {
	logo?: ReactNode
	navigation?: ReactNode
	actions?: ReactNode
	mobileMenu?: ReactNode
	isMenuOpen?: boolean
	onMenuOpenChange?: (isOpen: boolean) => void
}
