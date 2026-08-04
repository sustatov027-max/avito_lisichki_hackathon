import clsx from 'clsx'
import { forwardRef, useId } from 'react'

import styles from './Checkbox.module.scss'
import type { CheckboxProps } from './Checkbox.types'

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>((props, ref) => {
	const { className, description, disabled, id, label, ...rest } = props
	const generatedId = useId()
	const inputId = id ?? generatedId

	return (
		<label
			className={clsx(styles.root, disabled && styles.disabled, className)}
			htmlFor={inputId}
		>
			<input
				{...rest}
				ref={ref}
				id={inputId}
				className={styles.input}
				disabled={disabled}
				type='checkbox'
			/>
			<span className={styles.box} aria-hidden='true' />
			{(label || description) && (
				<span className={styles.content}>
					{label && <span className={styles.label}>{label}</span>}
					{description && (
						<span className={styles.description}>{description}</span>
					)}
				</span>
			)}
		</label>
	)
})

Checkbox.displayName = 'Checkbox'

export { Checkbox }
