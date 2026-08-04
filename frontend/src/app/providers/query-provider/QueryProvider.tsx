import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode, useState } from 'react'

const QueryProvider = (props: { children: ReactNode }) => {
	const { children } = props

	const [client] = useState(
		new QueryClient({
			defaultOptions: {
				queries: {
					refetchOnWindowFocus: false,
					staleTime: 1000 * 60 * 5,
					gcTime: 1000 * 60 * 10
				}
			}
		})
	)

	return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

export { QueryProvider }
