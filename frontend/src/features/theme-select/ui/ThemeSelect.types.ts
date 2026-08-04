import type { ButtonHTMLAttributes } from 'react'

export type ThemeSelectProps = Omit<
	ButtonHTMLAttributes<HTMLButtonElement>,
	'type' | 'children'
>
