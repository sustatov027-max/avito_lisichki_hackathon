import { CATEGORIES } from './categories.constants'

/** Возвращает данные категории по её UUID. */
export const getCategoryDataFromUUID = (categoryId?: string) =>
	CATEGORIES.find(category => category.id === categoryId)
