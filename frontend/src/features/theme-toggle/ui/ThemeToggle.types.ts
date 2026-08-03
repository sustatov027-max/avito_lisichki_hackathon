import type { ButtonHTMLAttributes } from 'react'

export type ThemeToggleProps = Omit<
	ButtonHTMLAttributes<HTMLButtonElement>,
	'type' | 'children'
>
