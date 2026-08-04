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

import type { ExchangeFormComponentsProps } from '../model/ExchangeFormComponents.types'

const ExchangeWantedFormFields = (props: ExchangeFormComponentsProps) => {
	const { form } = props

	const wantedCategoryId = useWatch({
		control: form.control,
		name: 'wanted_item.category_id'
	})

	const wantedAttributes = ATTRIBUTES.filter(
		attribute => attribute.categoryId === wantedCategoryId
	)

	return (
		<FormSection title='Нужный товар'>
			<FormField
				label='Название желаймого товара'
				name='wanted_item.title_query'
				isRequired
			>
				<Input
					id='wanted_item.title_query'
					placeholder='iPhone 16 Pro'
					{...form.register('wanted_item.title_query')}
				/>
			</FormField>
			<FormField name='wanted_item.category_id' label='Категория' isRequired>
				<Controller
					control={form.control}
					name='wanted_item.category_id'
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

			{wantedAttributes.map((attribute, index) => {
				if (attribute.type === 'range') {
					return (
						<>
							<Input
								type='hidden'
								{...form.register(
									`wanted_item.attributes.${index}.attribute_id` as const,
									{ value: attribute.id }
								)}
							/>
							<FormField
								label={`${attribute.label} минимум`}
								key={attribute.id}
								name={`wanted_item.attributes.${index}.min_value`}
							>
								<Input
									type='number'
									placeholder={`От ${attribute.min}`}
									{...form.register(
										`wanted_item.attributes.${index}.min_value`
									)}
								/>
							</FormField>
							<FormField
								label={`${attribute.label} максимум`}
								key={attribute.id}
								name={`wanted_item.attributes.${index}.max_value`}
							>
								<Input
									type='number'
									placeholder={`До ${attribute.max}`}
									{...form.register(
										`wanted_item.attributes.${index}.max_value`
									)}
								/>
							</FormField>
						</>
					)
				}
				if (attribute.type === 'select') {
					return (
						<FormField
							name='wanted_item.attributes.${index}.value'
							label='Категория'
							isRequired
						>
							<Input
								type='hidden'
								{...form.register(
									`wanted_item.attributes.${index}.attribute_id` as const,
									{ value: attribute.id }
								)}
							/>
							<Controller
								control={form.control}
								name={`wanted_item.attributes.${index}.value`}
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
															key={`${option}-${index}-wanted`}
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
						<FormField name='offered_item.' label='Категория' isRequired>
							<Input
								type='hidden'
								{...form.register(
									`wanted_item.attributes.${index}.attribute_id` as const,
									{ value: attribute.id }
								)}
							/>
							<Controller
								control={form.control}
								name={`wanted_item.attributes.${index}.values`}
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
						</FormField>
					)
				}
			})}
			<FormField name='wanted_item.min_price' label='Минимальная цена'>
				<Input
					type='number'
					id='wanted_item.min_price'
					placeholder='30000'
					{...form.register('wanted_item.min_price')}
				/>
			</FormField>
			<FormField name='wanted_item.max_price' label='Максимальная цена'>
				<Input
					type='number'
					id='wanted_item.max_price'
					placeholder='90000'
					{...form.register('wanted_item.max_price')}
				/>
			</FormField>
		</FormSection>
	)
}

export { ExchangeWantedFormFields }
