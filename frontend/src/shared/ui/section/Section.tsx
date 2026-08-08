import clsx from 'clsx'
import { motion } from 'framer-motion'
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
		<motion.section
			aria-labelledby={titleId}
			className={className}
			initial={{ opacity: 0, y: 16 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: 16 }}
			transition={{ duration: 0.2, ease: 'easeOut' }}
		>
			<div className={clsx('container', containerClassName)}>
				<h1
					id={titleId}
					className={clsx(isTitleHide && 'visually-hidden', titleClassName)}
				>
					{title}
				</h1>
				{children}
			</div>
		</motion.section>
	)
}

export { Section }
