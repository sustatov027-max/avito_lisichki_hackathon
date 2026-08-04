import clsx from 'clsx'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'

import { useOutside } from '@shared/lib/hooks/use-outside'

import { Button } from '../button/Button'

import styles from './Modal.module.scss'
import type { ModalProps } from './Modal.types'

const Modal = (props: ModalProps) => {
	const {
		open,
		onClose,
		children,
		title,
		description,
		ariaLabel = 'Modal',
		className,
		size = 'md',
		closeOnOverlayClick = true,
		closeOnEscape = true,
		showCloseButton = true
	} = props
	const titleId = useId()
	const descriptionId = useId()
	const {
		ref: contentRef,
		isClickOutside,
		setIsShow
	} = useOutside<HTMLDivElement>(open)
	const previousActiveElement = useRef<HTMLElement | null>(null)
	const shouldReduceMotion = useReducedMotion()

	useEffect(() => {
		setIsShow(open)
	}, [open, setIsShow])

	useEffect(() => {
		if (open && closeOnOverlayClick && isClickOutside) onClose()
	}, [closeOnOverlayClick, isClickOutside, onClose, open])

	useEffect(() => {
		if (!open) return

		previousActiveElement.current = document.activeElement as HTMLElement
		const previousOverflow = document.body.style.overflow
		document.body.style.overflow = 'hidden'
		contentRef.current?.focus()

		return () => {
			document.body.style.overflow = previousOverflow
			previousActiveElement.current?.focus()
		}
	}, [contentRef, open])

	useEffect(() => {
		if (!open || !closeOnEscape) return

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') onClose()
		}

		document.addEventListener('keydown', handleKeyDown)
		return () => document.removeEventListener('keydown', handleKeyDown)
	}, [closeOnEscape, onClose, open])

	if (typeof document === 'undefined') return null

	return createPortal(
		<AnimatePresence>
			{open && (
				<motion.div
					key='modal-overlay'
					className={styles.overlay}
					role='presentation'
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
				>
					<motion.div
						ref={contentRef}
						className={clsx(styles.content, styles[size], className)}
						role='dialog'
						aria-modal='true'
						aria-label={title ? undefined : ariaLabel}
						aria-labelledby={title ? titleId : undefined}
						aria-describedby={description ? descriptionId : undefined}
						tabIndex={-1}
						initial={{ opacity: 0, y: 8, scale: 0.98 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: 8, scale: 0.98 }}
						transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
					>
						{(title || showCloseButton) && (
							<header className={styles.header}>
								{title && (
									<h2 id={titleId} className={styles.title}>
										{title}
									</h2>
								)}
								{showCloseButton && (
									<Button
										onClick={onClose}
										variant='ghost'
										size='sm'
										onlyIcon
										ariaLabel='Close modal'
										className={styles.closeButton}
									>
										<X aria-hidden='true' />
									</Button>
								)}
							</header>
						)}
						{description && (
							<p id={descriptionId} className={styles.description}>
								{description}
							</p>
						)}
						<div className={styles.body}>{children}</div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>,
		document.body
	)
}

export { Modal }
