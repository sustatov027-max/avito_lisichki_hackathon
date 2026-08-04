import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import clsx from 'clsx'
import type { ElementRef } from 'react'
import { forwardRef } from 'react'

import styles from './Tooltip.module.scss'
import type {
	TooltipContentProps,
	TooltipProps,
	TooltipProviderProps,
	TooltipTriggerProps
} from './Tooltip.types'

type TooltipContentExtraProps = {
	showArrow?: boolean
}

const TooltipProvider = (props: TooltipProviderProps) => {
	const {
		children,
		delayDuration = 400,
		skipDelayDuration = 150,
		...providerProps
	} = props

	return (
		<TooltipPrimitive.Provider
			delayDuration={delayDuration}
			skipDelayDuration={skipDelayDuration}
			{...providerProps}
		>
			{children}
		</TooltipPrimitive.Provider>
	)
}

const Tooltip = (props: TooltipProps) => <TooltipPrimitive.Root {...props} />

const TooltipTrigger = forwardRef<
	ElementRef<typeof TooltipPrimitive.Trigger>,
	TooltipTriggerProps
>((props, ref) => {
	const { className, ...triggerProps } = props

	return (
		<TooltipPrimitive.Trigger
			ref={ref}
			className={className}
			{...triggerProps}
		/>
	)
})
TooltipTrigger.displayName = TooltipPrimitive.Trigger.displayName

const TooltipContent = forwardRef<
	ElementRef<typeof TooltipPrimitive.Content>,
	TooltipContentProps & TooltipContentExtraProps
>((props, ref) => {
	const {
		children,
		className,
		sideOffset = 8,
		showArrow = true,
		...contentProps
	} = props

	return (
		<TooltipPrimitive.Portal>
			<TooltipPrimitive.Content
				ref={ref}
				className={clsx(styles.content, className)}
				sideOffset={sideOffset}
				{...contentProps}
			>
				{children}
				{showArrow ? <TooltipPrimitive.Arrow className={styles.arrow} /> : null}
			</TooltipPrimitive.Content>
		</TooltipPrimitive.Portal>
	)
})
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger }
