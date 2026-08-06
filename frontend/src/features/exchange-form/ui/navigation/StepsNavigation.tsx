import { ArrowLeft, ArrowRight, Trash2 } from 'lucide-react'
import { useWatch } from 'react-hook-form'

import { EXCHANGE_STEPS, FIELDS_BY_STEPS, type ExchangeFormComponentsProps } from '@features/exchange-form'

import { Button, Tooltip, TooltipContent, TooltipTrigger } from '@shared/ui'

import { useExchangeStepFormStore } from '../../model/exchange-form-step.store'

import styles from '../ExchangeForm.module.scss'

const StepsNavigation = (props: ExchangeFormComponentsProps) => {
	const { form } = props
	useWatch({ control: form.control })

	const step = useExchangeStepFormStore(state => state.step)
	const updateData = useExchangeStepFormStore(state => state.updateData)
	const forwardStep = useExchangeStepFormStore(state => state.forwardStep)
	const backStep = useExchangeStepFormStore(state => state.backStep)

	const hasValue = (value: unknown): boolean => {
		if (typeof value === 'string') return value.trim().length > 0
		if (typeof value === 'boolean') return value
		if (Array.isArray(value)) return value.length > 0
		if (value && typeof value === 'object') {
			return Object.values(value).some(hasValue)
		}
		return value !== undefined && value !== null
	}

	const hasStepData =
		step !== EXCHANGE_STEPS.CONFIRM &&
		FIELDS_BY_STEPS[step].some(field => hasValue(form.getValues(field)))

	const onForwardButtonClick = async () => {
		const isValid = await form.trigger(FIELDS_BY_STEPS[step])

		if (!isValid) return

		updateData(form.getValues())
		forwardStep()
	}

	const onBackButtonClick = () => {
		updateData(form.getValues())
		backStep()
	}

	const onClearStepButtonClick = () => {
		const values = form.getValues()

		switch (step) {
			case EXCHANGE_STEPS.ONBOARD:
				form.reset({
					...values,
					user_id: '',
					city_name: '',
					delivery_enabled: false
				})
				break

			case EXCHANGE_STEPS.OFFERED:
				form.reset({
					...values,
					offered_item: {
						title: '',
						estimated_price: '',
						category_id: '',
						attributes: []
					}
				})
				break

			case EXCHANGE_STEPS.WANTED:
				form.reset({
					...values,
					wanted_item: {
						title_query: '',
						category_id: '',
						attributes: [],
						min_price: '',
						max_price: ''
					}
				})
				break
		}

		updateData(form.getValues())
	}

	return (
		<div className={styles.buttons}>
			<div className={styles.navigation}>
				{!(step === EXCHANGE_STEPS.ONBOARD) && (
					<Button type='button' variant='secondary' onClick={onBackButtonClick}>
						<ArrowLeft size={20} /> Назад
					</Button>
				)}
				{step !== EXCHANGE_STEPS.CONFIRM && (
					<Button
						type='button'
						variant='secondary'
						onClick={onForwardButtonClick}
					>
						Далее <ArrowRight size={20} />
					</Button>
				)}
				{step === EXCHANGE_STEPS.CONFIRM && (
					<Button type='submit'>Отправить</Button>
				)}
			</div>

			{hasStepData && (
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							type='button'
							variant='red'
							onClick={onClearStepButtonClick}
							ariaLabel='Очистить текущий шаг'
							onlyIcon
						>
							<Trash2 size={20} />
						</Button>
					</TooltipTrigger>
					<TooltipContent>Очистить поля</TooltipContent>
				</Tooltip>
			)}
		</div>
	)
}

export { StepsNavigation }
