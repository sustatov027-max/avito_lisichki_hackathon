import type * as TooltipPrimitive from '@radix-ui/react-tooltip'

export type TooltipProps = React.ComponentProps<typeof TooltipPrimitive.Root>
export type TooltipProviderProps = React.ComponentProps<
	typeof TooltipPrimitive.Provider
>
export type TooltipTriggerProps = React.ComponentPropsWithoutRef<
	typeof TooltipPrimitive.Trigger
>
export type TooltipContentProps = React.ComponentPropsWithoutRef<
	typeof TooltipPrimitive.Content
>
