import { motion } from 'framer-motion'
import { Outlet } from 'react-router'

import { ThemeToggle } from '@features/theme-toggle'

import { UserSwitcher } from '@shared/ui/user-switcher/UserSwitcher'

import styles from './HomeLayout.module.scss'

const HomeLayout = () => {
	return (
		<>
			<motion.main
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				transition={{ duration: 0.5 }}
			>
				<header className={styles.header}>
					<div>
						<UserSwitcher />
						<ThemeToggle className={styles.themeToggle} />
					</div>
				</header>
				<Outlet />
			</motion.main>
		</>
	)
}

export { HomeLayout }
