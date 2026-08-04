'use client'

import { Controller, useWatch } from 'react-hook-form'

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

import type { ExchangeFormComponentsProps } from '../model/exchange.types'

import styles from './ExchangeForm.module.scss'

const ExchangeOfferedFormField = (props: ExchangeFormComponentsProps) => {
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
										onValueChange={value => field.onChange(Number(value))}
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
						<div className={styles.smFieldsGroup}>
							<Input
								type='hidden'
								{...form.register(
									`offered_item.attributes.${index}.attribute_id` as const,
									{ value: attribute.id }
								)}
							/>
							<FormField
								label={`${attribute.label} минимум`}
								key={attribute.id}
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
								key={attribute.id}
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
						<>
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
						</>
					)
				}

				if (attribute.type === 'multiple-select') {
					return (
						<>
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
						</>
					)
				}
			})}
		</FormSection>
	)
}

export { ExchangeOfferedFormField }
