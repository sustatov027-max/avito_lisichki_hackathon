import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import clsx from 'clsx'
import { Check, ChevronDown, ChevronRight, Circle } from 'lucide-react'
import type { ComponentPropsWithoutRef, ElementRef } from 'react'
import { forwardRef } from 'react'

import styles from './Dropdown.module.scss'
import type {
	DropdownCheckboxItemProps,
	DropdownContentProps,
	DropdownItemProps,
	DropdownLabelProps,
	DropdownProps,
	DropdownRadioGroupProps,
	DropdownRadioItemProps,
	DropdownSeparatorProps,
	DropdownSubContentProps,
	DropdownSubProps,
	DropdownSubTriggerProps,
	DropdownTriggerProps
} from './Dropdown.types'

const Dropdown = (props: DropdownProps) => (
	<DropdownMenuPrimitive.Root {...props} />
)

type DropdownTriggerExtraProps = {
	showIcon?: boolean
}

const DropdownTrigger = forwardRef<
	ElementRef<typeof DropdownMenuPrimitive.Trigger>,
	DropdownTriggerProps & DropdownTriggerExtraProps
>((props, ref) => {
	const { className, children, showIcon = true, asChild, ...rest } = props

	if (asChild) {
		return (
			<DropdownMenuPrimitive.Trigger
				ref={ref}
				className={className}
				asChild
				{...rest}
			>
				{children}
			</DropdownMenuPrimitive.Trigger>
		)
	}

	return (
		<DropdownMenuPrimitive.Trigger
			ref={ref}
			className={clsx(styles.trigger, className)}
			{...rest}
		>
			{children}
			{showIcon && (
				<ChevronDown className={styles.triggerIcon} aria-hidden='true' />
			)}
		</DropdownMenuPrimitive.Trigger>
	)
})
DropdownTrigger.displayName = DropdownMenuPrimitive.Trigger.displayName

const DropdownContent = forwardRef<
	ElementRef<typeof DropdownMenuPrimitive.Content>,
	DropdownContentProps
>((props, ref) => {
	const { className, sideOffset = 8, ...rest } = props

	return (
		<DropdownMenuPrimitive.Portal>
			<DropdownMenuPrimitive.Content
				ref={ref}
				className={clsx(styles.content, className)}
				sideOffset={sideOffset}
				{...rest}
			/>
		</DropdownMenuPrimitive.Portal>
	)
})
DropdownContent.displayName = DropdownMenuPrimitive.Content.displayName

const DropdownItem = forwardRef<
	ElementRef<typeof DropdownMenuPrimitive.Item>,
	DropdownItemProps
>((props, ref) => {
	const { className, ...rest } = props

	return (
		<DropdownMenuPrimitive.Item
			ref={ref}
			className={clsx(styles.item, className)}
			{...rest}
		/>
	)
})
DropdownItem.displayName = DropdownMenuPrimitive.Item.displayName

const DropdownCheckboxItem = forwardRef<
	ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
	DropdownCheckboxItemProps
>((props, ref) => {
	const {
		className,
		children,
		checked,
		closeOnSelect = true,
		onSelect,
		...rest
	} = props

	return (
		<DropdownMenuPrimitive.CheckboxItem
			ref={ref}
			className={clsx(styles.checkboxItem, className)}
			checked={checked}
			onSelect={event => {
				onSelect?.(event)
				if (!closeOnSelect) event.preventDefault()
			}}
			{...rest}
		>
			<span className={styles.indicator} aria-hidden='true'>
				{checked ? <Check size={16} strokeWidth={2} /> : null}
			</span>
			{children}
		</DropdownMenuPrimitive.CheckboxItem>
	)
})
DropdownCheckboxItem.displayName =
	DropdownMenuPrimitive.CheckboxItem.displayName

const DropdownRadioGroup = (props: DropdownRadioGroupProps) => (
	<DropdownMenuPrimitive.RadioGroup {...props} />
)

const DropdownRadioItem = forwardRef<
	ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
	DropdownRadioItemProps
>((props, ref) => {
	const { className, children, ...rest } = props

	return (
		<DropdownMenuPrimitive.RadioItem
			ref={ref}
			className={clsx(styles.radioItem, className)}
			{...rest}
		>
			<span className={styles.indicator} aria-hidden='true'>
				<DropdownMenuPrimitive.ItemIndicator>
					<Circle size={8} fill='currentColor' strokeWidth={0} />
				</DropdownMenuPrimitive.ItemIndicator>
			</span>
			{children}
		</DropdownMenuPrimitive.RadioItem>
	)
})
DropdownRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName

const DropdownLabel = forwardRef<
	ElementRef<typeof DropdownMenuPrimitive.Label>,
	DropdownLabelProps
>((props, ref) => {
	const { className, ...rest } = props

	return (
		<DropdownMenuPrimitive.Label
			ref={ref}
			className={clsx(styles.label, className)}
			{...rest}
		/>
	)
})
DropdownLabel.displayName = DropdownMenuPrimitive.Label.displayName

const DropdownSeparator = forwardRef<
	ElementRef<typeof DropdownMenuPrimitive.Separator>,
	DropdownSeparatorProps
>((props, ref) => {
	const { className, ...rest } = props

	return (
		<DropdownMenuPrimitive.Separator
			ref={ref}
			className={clsx(styles.separator, className)}
			{...rest}
		/>
	)
})
DropdownSeparator.displayName = DropdownMenuPrimitive.Separator.displayName

const DropdownSub = (props: DropdownSubProps) => (
	<DropdownMenuPrimitive.Sub {...props} />
)

const DropdownSubTrigger = forwardRef<
	ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
	DropdownSubTriggerProps
>((props, ref) => {
	const { className, children, ...rest } = props

	return (
		<DropdownMenuPrimitive.SubTrigger
			ref={ref}
			className={clsx(styles.subTrigger, className)}
			{...rest}
		>
			{children}
			<ChevronRight
				className={styles.subTriggerIcon}
				aria-hidden='true'
				size={16}
			/>
		</DropdownMenuPrimitive.SubTrigger>
	)
})
DropdownSubTrigger.displayName = DropdownMenuPrimitive.SubTrigger.displayName

const DropdownSubContent = forwardRef<
	ElementRef<typeof DropdownMenuPrimitive.SubContent>,
	DropdownSubContentProps
>((props, ref) => {
	const { className, sideOffset = 8, ...rest } = props

	return (
		<DropdownMenuPrimitive.Portal>
			<DropdownMenuPrimitive.SubContent
				ref={ref}
				className={clsx(styles.subContent, className)}
				sideOffset={sideOffset}
				{...rest}
			/>
		</DropdownMenuPrimitive.Portal>
	)
})
DropdownSubContent.displayName = DropdownMenuPrimitive.SubContent.displayName

const DropdownShortcut = (props: ComponentPropsWithoutRef<'span'>) => {
	const { className, ...rest } = props

	return <span className={clsx(styles.shortcut, className)} {...rest} />
}

export {
	Dropdown,
	DropdownCheckboxItem,
	DropdownContent,
	DropdownItem,
	DropdownLabel,
	DropdownRadioGroup,
	DropdownRadioItem,
	DropdownSeparator,
	DropdownShortcut,
	DropdownSub,
	DropdownSubContent,
	DropdownSubTrigger,
	DropdownTrigger
}
