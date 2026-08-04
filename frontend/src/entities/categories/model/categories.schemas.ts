import z from 'zod'

import { CATEGORIES } from './categories.constants'

const categoryIdLiterals = CATEGORIES.map(category =>
	z.literal(category.id)
) as [z.ZodLiteral<number>, ...z.ZodLiteral<number>[]]

export const categoryIdSchema = z.union(categoryIdLiterals)
