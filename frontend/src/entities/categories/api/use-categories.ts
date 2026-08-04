import { useQuery } from '@tanstack/react-query'

import { categoriesService } from './categories.services'

export const useCategories = () => {
	const {
		data: categories,
		isLoading,
		error
	} = useQuery({
		queryKey: ['categories'],
		queryFn: categoriesService.getCategories
	})

	return { categories, isLoading, error }
}
