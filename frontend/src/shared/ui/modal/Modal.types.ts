import type { ReactNode } from 'react'

export type ModalProps = {
	open: boolean
	onClose: () => void
	children: ReactNode
	title?: ReactNode
	description?: ReactNode
	ariaLabel?: string
	className?: string
	size?: 'sm' | 'md' | 'lg'
	closeOnOverlayClick?: boolean
	closeOnEscape?: boolean
	showCloseButton?: boolean
}
