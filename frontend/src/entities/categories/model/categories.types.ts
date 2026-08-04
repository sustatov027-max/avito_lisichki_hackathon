// category.types.ts

type CategoryId =
	| 100
	| 101
	| 102
	| 103
	| 200
	| 201
	| 202
	| 203
	| 300
	| 301
	| 302
	| 400
	| 401
	| 500

type AttributeValueType = 'string' | 'number' | 'boolean' | 'select'

type AttributeOption = {
	label: string
	value: string
}

type CategoryAttribute = {
	id: number
	name: string
	label: string
	type: AttributeValueType
	required?: boolean
	options?: AttributeOption[]
}

type Category = {
	id: CategoryId
	name: string
	parentId: CategoryId | null
	attributes: CategoryAttribute[]
}

export type {
	AttributeOption,
	AttributeValueType,
	Category,
	CategoryAttribute,
	CategoryId
}
