import { type AxiosResponse } from 'axios'

import { axiosClassic } from '@shared/api'

import type { Category } from '../model/categories.types'

class CategoriesService {
	async getCategories() {
		const response: AxiosResponse<Category[]> = await axiosClassic({
			url: '/categories',
			method: 'GET'
		})

		return response.data
	}
}

export const categoriesService = new CategoriesService()
