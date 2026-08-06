import { useEffect, useState } from 'react'

export const useDebounce = <T>(data: T, delay: number) => {
	const [debouncedData, setDebouncedData] = useState(data)

	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedData(data)
		}, delay)

		return () => clearTimeout(timer)
	}, [data, delay])

	return debouncedData
}
