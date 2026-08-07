import { ATTRIBUTES } from '@entities/categories/model/attributes.constants'

import type { ExchangeFormDataInput } from './exchange-form.schema'

type ItemAttributes = ExchangeFormDataInput['offered_item']['attributes']
type ItemKind = 'offered' | 'wanted'

const getCategoryDefaultAttributes = (
	categoryId: string,
	itemKind: ItemKind
): ItemAttributes =>
	ATTRIBUTES.filter(attribute => attribute.categoryId === categoryId).map(
		attribute => {
			if (
				itemKind === 'offered' &&
				attribute.type === 'range' &&
				attribute.label === 'Память'
			) {
				return { attribute_id: attribute.id, value: undefined }
			}

			if (attribute.type === 'range') {
				return {
					attribute_id: attribute.id,
					min_value: undefined,
					max_value: undefined
				}
			}

			if (attribute.type === 'multiple-select') {
				return { attribute_id: attribute.id, values: undefined }
			}

			return { attribute_id: attribute.id, value: undefined }
		}
	)

export { getCategoryDefaultAttributes }
