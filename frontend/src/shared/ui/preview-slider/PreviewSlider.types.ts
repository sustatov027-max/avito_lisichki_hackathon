import type { HTMLAttributes } from 'react'

export type PreviewSliderProps = Omit<
	HTMLAttributes<HTMLDivElement>,
	'children'
> & {
	images: string[]
}
