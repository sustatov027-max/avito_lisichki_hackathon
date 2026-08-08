import clsx from 'clsx'
import type { PropsWithChildren } from 'react'

import type { SectionProps } from './Section.types'

const Section = (props: PropsWithChildren<SectionProps>) => {
	const {
		id,
		title,
		isTitleHide = false,
		className,
		titleClassName,
		containerClassName,
		children
	} = props

	const titleId = `${id}-title`

	return (
		<section aria-labelledby={titleId} className={className}>
			<div className={clsx('container', containerClassName)}>
				<h1
					id={titleId}
					className={clsx(isTitleHide && 'visually-hidden', titleClassName)}
				>
					{title}
				</h1>
				{children}
			</div>
		</section>
	)
}

export { Section }
