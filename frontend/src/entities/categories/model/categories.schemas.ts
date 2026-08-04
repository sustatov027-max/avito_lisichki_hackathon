import z from 'zod'

import { CATEGORIES } from './categories.constants'

const categoryIdLiterals = CATEGORIES.map(category =>
	z.literal(category.id)
) as [z.ZodLiteral<string>, ...z.ZodLiteral<string>[]]

export const categoryIdSchema = z.union(categoryIdLiterals)
