import { Controller, useWatch } from 'react-hook-form'

import type { ExchangeFormComponentsProps } from '@features/exchange-form'

import { ATTRIBUTES } from '@entities/categories/model/attributes.constants'
import { CATEGORIES } from '@entities/categories/model/categories.constants'

import {
	Dropdown,
	DropdownCheckboxItem,
	DropdownContent,
	DropdownRadioGroup,
	DropdownRadioItem,
	DropdownTrigger,
	FormField,
	FormSection,
	Input
} from '@shared/ui'

import styles from '../../ExchangeForm.module.scss'

const OfferedFormStep = (props: ExchangeFormComponentsProps) => {
	const { form } = props

	const offeredCategoryId = useWatch({
		control: form.control,
		name: 'offered_item.category_id'
	})

	const offeredAttributes = ATTRIBUTES.filter(
		attribute => attribute.categoryId === offeredCategoryId
	)

	return (
		<FormSection
			title='Предлагаемый товар'
			description='Товар который вы можете предложить'
		>
			<FormField label='Название товара' name='offered_item.title' isRequired>
				<Input
					id='offered_item.title'
					placeholder='iPhone 16 Pro'
					{...form.register('offered_item.title')}
				/>
			</FormField>
			<FormField
				label='Оценочная стоимость ₽'
				name='offered_item.estimated_price'
				isRequired
			>
				<Input
					type='number'
					id='offered_item.estimated_price'
					placeholder='50000'
					{...form.register('offered_item.estimated_price')}
				/>
			</FormField>
			<FormField name='offered_item.category_id' label='Категория' isRequired>
				<Controller
					control={form.control}
					name='offered_item.category_id'
					render={({ field }) => {
						const selectedCategory = CATEGORIES.find(
							category => category.id === field.value
						)

						return (
							<Dropdown>
								<DropdownTrigger type='button'>
									{selectedCategory?.name ?? 'Выберите категорию'}
								</DropdownTrigger>

								<DropdownContent>
									<DropdownRadioGroup
										value={String(field.value ?? '')}
										onValueChange={categoryId => {
											field.onChange(categoryId)
											form.setValue('offered_item.attributes', [])
											form.clearErrors('offered_item.attributes')
										}}
									>
										{CATEGORIES.filter(
											category => category.parentId !== null
										).map(category => (
											<DropdownRadioItem
												key={category.id}
												value={String(category.id)}
											>
												{category.name}
											</DropdownRadioItem>
										))}
									</DropdownRadioGroup>
								</DropdownContent>
							</Dropdown>
						)
					}}
				/>
			</FormField>
			{offeredAttributes.map((attribute, index) => {
				if (attribute.type === 'range') {
					return (
						<div
							className={styles.smFieldsGroup}
							key={`${offeredCategoryId}-${attribute.id}`}
						>
							<Input
								type='hidden'
								{...form.register(
									`offered_item.attributes.${index}.attribute_id` as const,
									{ value: attribute.id }
								)}
							/>
							<FormField
								label={`${attribute.label} минимум`}
								name={`offered_item.attributes.${index}.min_value`}
							>
								<Input
									type='number'
									placeholder={`От ${attribute.min}`}
									{...form.register(
										`offered_item.attributes.${index}.min_value`
									)}
								/>
							</FormField>
							<FormField
								label={`${attribute.label} максимум`}
								name={`offered_item.attributes.${index}.max_value`}
							>
								<Input
									type='number'
									placeholder={`До ${attribute.max}`}
									{...form.register(
										`offered_item.attributes.${index}.max_value`
									)}
								/>
							</FormField>
						</div>
					)
				}
				if (attribute.type === 'select') {
					return (
						<FormField
							name={`offered_item.attributes.${index}.value`}
							label={attribute.label}
							key={`${offeredCategoryId}-${attribute.id}`}
						>
							<Input
								type='hidden'
								{...form.register(
									`offered_item.attributes.${index}.attribute_id` as const,
									{ value: attribute.id }
								)}
							/>
							<Controller
								control={form.control}
								name={`offered_item.attributes.${index}.value`}
								render={({ field }) => {
									const selectedAttributeOption = attribute.options.find(
										option => option.name === field.value
									)

									return (
										<Dropdown>
											<DropdownTrigger type='button'>
												{selectedAttributeOption?.label ?? attribute.label}
											</DropdownTrigger>

											<DropdownContent>
												<DropdownRadioGroup
													value={field.value ?? ''}
													onValueChange={value => field.onChange(value)}
												>
													{attribute.options.map((option, index) => (
														<DropdownRadioItem
															key={`${option}-${index}`}
															value={option.name}
														>
															{option.label}
														</DropdownRadioItem>
													))}
												</DropdownRadioGroup>
											</DropdownContent>
										</Dropdown>
									)
								}}
							/>
						</FormField>
					)
				}

				if (attribute.type === 'multiple-select') {
					return (
						<FormField
							name={`offered_item.attributes.${index}.value`}
							label={attribute.label}
							key={`${offeredCategoryId}-${attribute.id}`}
						>
							<Input
								type='hidden'
								{...form.register(
									`offered_item.attributes.${index}.attribute_id` as const,
									{ value: attribute.id }
								)}
							/>
							<Controller
								control={form.control}
								name={`offered_item.attributes.${index}.values`}
								render={({ field }) => {
									const selectedValues = field.value ?? []

									return (
										<Dropdown>
											<DropdownTrigger type='button'>
												{selectedValues.length
													? `${selectedValues.length} выбрано`
													: attribute.label}
											</DropdownTrigger>

											<DropdownContent>
												{attribute.options.map(option => (
													<DropdownCheckboxItem
														key={option.name}
														checked={selectedValues.includes(option.name)}
														closeOnSelect={false}
														onCheckedChange={checked => {
															field.onChange(
																checked
																	? [...selectedValues, option.name]
																	: selectedValues.filter(
																			value => value !== option.name
																		)
															)
														}}
													>
														{option.label}
													</DropdownCheckboxItem>
												))}
											</DropdownContent>
										</Dropdown>
									)
								}}
							/>
						</FormField>
					)
				}
			})}
		</FormSection>
	)
}

export { OfferedFormStep }
