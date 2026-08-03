import { motion } from 'framer-motion'
import { useState } from 'react'
import { NavLink, Outlet } from 'react-router'

import { BurgerButton, Header } from '@shared/ui'

const HomeLayout = () => {
	const [isMenuOpen, setIsMenuOpen] = useState(false)

	return (
		<>
			<Header
				logo='UI Kit'
				navigation={
					<>
						<NavLink to='/'>Home</NavLink>
						<NavLink to='/admin'>Admin</NavLink>
					</>
				}
				mobileMenu={
					<BurgerButton
						isOpen={isMenuOpen}
						onClick={() => setIsMenuOpen(value => !value)}
					/>
				}
				isMenuOpen={isMenuOpen}
				onMenuOpenChange={setIsMenuOpen}
			/>
			<motion.main
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				transition={{ duration: 0.5 }}
			>
				<Outlet />
			</motion.main>
		</>
	)
}

export { HomeLayout }
