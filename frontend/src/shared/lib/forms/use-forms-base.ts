import { zodResolver } from '@hookform/resolvers/zod'
import {
	type DefaultValues,
	type FieldValues,
	type SubmitHandler,
	useForm
} from 'react-hook-form'
import type { z } from 'zod'

export type UseFormsBaseProps<
	TInput extends FieldValues,
	TOutput extends FieldValues
> = {
	schema: z.ZodType<TOutput, TInput>
	defaultValues: DefaultValues<TInput>
	onSubmit?: SubmitHandler<TOutput>
}

export const useFormsBase = <
	TInput extends FieldValues,
	TOutput extends FieldValues
>(
	props: UseFormsBaseProps<TInput, TOutput>
) => {
	const { schema, defaultValues, onSubmit } = props
	const form = useForm<TInput, unknown, TOutput>({
		resolver: zodResolver(schema),
		mode: 'onChange',
		defaultValues
	})

	return {
		...form,
		onSubmit: form.handleSubmit(async data => {
			await onSubmit?.(data)
		})
	}
}
