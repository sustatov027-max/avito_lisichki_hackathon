import type { ButtonHTMLAttributes } from 'react'

export type BurgerButtonProps = Omit<
	ButtonHTMLAttributes<HTMLButtonElement>,
	'type' | 'aria-label' | 'aria-expanded' | 'children'
> & {
	isOpen?: boolean
	ariaLabel?: string
}
