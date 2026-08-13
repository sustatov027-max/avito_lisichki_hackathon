import { Controller, useWatch } from 'react-hook-form'

import type { ExchangeFormComponentsProps } from '@features/create-exchange-form'
import { getCategoryDefaultAttributes } from '@features/create-exchange-form/model/create-exchange-form.helpers'

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
	Input,
	Textarea
} from '@shared/ui'

import { OfferedPhotosField } from './OfferedPhotosField'

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
											form.unregister('offered_item.attributes')
											field.onChange(categoryId)
											form.setValue(
												'offered_item.attributes',
												getCategoryDefaultAttributes(categoryId, 'offered'),
												{ shouldDirty: true }
											)
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
						<FormField
							label={attribute.label}
							name={`offered_item.attributes.${index}.value`}
							key={`${offeredCategoryId}-${attribute.id}`}
						>
							<Input
								type='hidden'
								{...form.register(
									`offered_item.attributes.${index}.attribute_id` as const,
									{ value: attribute.id }
								)}
							/>
							<Input
								type='number'
								min={0}
								placeholder={String(attribute.min)}
								{...form.register(`offered_item.attributes.${index}.value`, {
									setValueAs: value =>
										value === '' ? undefined : Number(value)
								})}
							/>
						</FormField>
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
													value={String(field.value ?? '')}
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
							name={`offered_item.attributes.${index}.values`}
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

			<FormField name='offered_item.description' label='Описание'>
				<Textarea
					id='offered_item.description'
					placeholder='Данный iPhone 16 Pro имеет...'
					{...form.register('offered_item.description')}
				/>
			</FormField>

			<OfferedPhotosField form={form} />
		</FormSection>
	)
}

export { OfferedFormStep }
