import clsx from 'clsx'
import { forwardRef } from 'react'

import styles from './BurgerButton.module.scss'
import type { BurgerButtonProps } from './BurgerButton.types'

const BurgerButton = forwardRef<HTMLButtonElement, BurgerButtonProps>(
	(props, ref) => {
		const {
			className,
			isOpen = false,
			ariaLabel = isOpen ? 'Закрыть меню' : 'Открыть меню',
			onClick,
			...rest
		} = props

		return (
			<button
				ref={ref}
				className={clsx(styles.button, isOpen && styles.open, className)}
				aria-label={ariaLabel}
				aria-expanded={isOpen}
				title={ariaLabel}
				type='button'
				onClick={onClick}
				{...rest}
			>
				<span className={styles.line} aria-hidden='true' />
				<span className={styles.line} aria-hidden='true' />
				<span className={styles.line} aria-hidden='true' />
			</button>
		)
	}
)

BurgerButton.displayName = 'BurgerButton'

export { BurgerButton }
