import type { HTMLAttributes } from 'react'

export type ModalSliderProps = Omit<
	HTMLAttributes<HTMLDivElement>,
	'children'
> & {
	images: string[]
	imageAlt: string
}
