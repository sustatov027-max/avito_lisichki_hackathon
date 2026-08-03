import { AnimatePresence } from 'framer-motion'
import { Outlet, useNavigation } from 'react-router'

import { Preloader } from '@shared/ui'

const RootLayout = () => {
	const navigation = useNavigation()

	return (
		<>
			<AnimatePresence>
				<Preloader isLoading={navigation.state === 'loading'} />
				<Outlet />
			</AnimatePresence>
		</>
	)
}

export { RootLayout }
