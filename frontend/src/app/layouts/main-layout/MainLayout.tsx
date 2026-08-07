import { motion } from 'framer-motion'
import { Outlet } from 'react-router'

import { MainHeader } from '@widgets/main-header'

const MainLayout = () => {
	return (
		<>
			<motion.main
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				transition={{ duration: 0.5 }}
			>
				<MainHeader />
				<Outlet />
			</motion.main>
		</>
	)
}

export { MainLayout }
