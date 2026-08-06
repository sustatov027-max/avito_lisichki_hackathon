import { ATTRIBUTES } from '@entities/categories/model/attributes.constants'

import type { ExchangeFormDataInput } from './exchange-form.schema'

type ItemAttributes = ExchangeFormDataInput['offered_item']['attributes']

const getCategoryDefaultAttributes = (categoryId: string): ItemAttributes =>
	ATTRIBUTES.filter(attribute => attribute.categoryId === categoryId).map(
		attribute => {
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
