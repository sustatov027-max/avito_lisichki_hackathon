import clsx from 'clsx'
import { Info } from 'lucide-react'
import { forwardRef } from 'react'

import { Tooltip, TooltipContent, TooltipTrigger } from '@shared/ui/tooltip'

import styles from './Form.module.scss'
import type { FormSectionProps } from './Form.types'

const FormSection = forwardRef<HTMLElement, FormSectionProps>((props, ref) => {
	const {
		align = 'start',
		children,
		className,
		description,
		title,
		...rest
	} = props

	return (
		<section
			ref={ref}
			className={clsx(styles.section, styles[align], className)}
			{...rest}
		>
			{title && (
				<h3 className={styles.sectionTitle}>
					{title}
					{description && (
						<Tooltip>
							<TooltipTrigger asChild>
								<div className={styles.sectionDescription}>
									<Info size={16} opacity={0.5} />
								</div>
							</TooltipTrigger>
							<TooltipContent>{description}</TooltipContent>
						</Tooltip>
					)}
				</h3>
			)}
			{children}
		</section>
	)
})

FormSection.displayName = 'FormSection'

export { FormSection }
