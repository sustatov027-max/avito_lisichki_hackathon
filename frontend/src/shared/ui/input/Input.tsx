import clsx from 'clsx'
import { type KeyboardEvent, forwardRef } from 'react'

import styles from './Input.module.scss'
import type { InputProps } from './Input.types'

const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
	const onNumberKeyDownGuard = (event: KeyboardEvent<HTMLInputElement>) => {
		const allowedKeys = [
			'Backspace',
			'Delete',
			'ArrowLeft',
			'ArrowRight',
			'ArrowUp',
			'ArrowDown',
			'Home',
			'End',
			'Tab',
			'Enter',
			'-',
			'.',
			'+'
		]

		if (allowedKeys.includes(event.key)) {
			return
		}

		if (!/^[0-9]$/.test(event.key)) {
			event.preventDefault()
		}
	}

	return (
		<input
			{...props}
			ref={ref}
			onKeyDown={event => {
				if (props.type === 'number') {
					onNumberKeyDownGuard(event)
				}
				props?.onKeyDown?.(event)
			}}
			className={clsx(styles.input, props.className)}
		/>
	)
})

Input.displayName = 'Input'

export { Input }
