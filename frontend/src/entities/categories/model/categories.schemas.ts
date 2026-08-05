import z from 'zod'

import { CATEGORIES } from './categories.constants'

const categoryIds: readonly string[] = CATEGORIES.map(category => category.id)

export const categoryIdSchema = z
	.string({ error: 'Выберите категорию' })
	.min(1, 'Выберите категорию')
	.refine(value => categoryIds.includes(value), 'Выберите категорию')
