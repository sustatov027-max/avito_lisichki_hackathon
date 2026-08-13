import clsx from 'clsx'
import { motion } from 'framer-motion'
import type { PropsWithChildren } from 'react'

import styles from './Section.module.scss'
import type { SectionProps } from './Section.types'

const Section = (props: PropsWithChildren<SectionProps>) => {
	const {
		id,
		title,
		isTitleHide = false,
		className,
		titleClassName,
		containerClassName,
		children,
		actions
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
			<div className={clsx('container', containerClassName, styles.body)}>
				{actions ? (
					<div className={styles.header}>
						<h1
							id={titleId}
							className={clsx(
								isTitleHide && 'visually-hidden',
								titleClassName,
								styles.title
							)}
						>
							{title}
						</h1>
						<div className={styles.actions}>{actions}</div>
					</div>
				) : (
					<h1
						id={titleId}
						className={clsx(
							isTitleHide && 'visually-hidden',
							titleClassName,
							styles.title
						)}
					>
						{title}
					</h1>
				)}
				{children}
			</div>
		</motion.section>
	)
}

export { Section }
