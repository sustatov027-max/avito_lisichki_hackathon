import { useState } from 'react'
import { NavLink } from 'react-router'

import { ThemeToggle } from '@features/theme-toggle'

import { ROUTES } from '@shared/constants/routes'
import { BurgerButton, Header, Logo } from '@shared/ui'
import { UserSwitcher } from '@shared/ui/user-switcher/UserSwitcher'

import styles from './MainHeader.module.scss'

const MainHeader = () => {
	const [isMenuOpen, setIsMenuOpen] = useState(false)

	return (
		<Header
			isMenuOpen={isMenuOpen}
			onMenuOpenChange={setIsMenuOpen}
			logo={<Logo />}
			navigation={
				<ul className={styles.navList}>
					<li>
						<NavLink
							to={ROUTES.EXCHANGES}
							className={styles.navLink}
							onClick={() => setIsMenuOpen(false)}
						>
							Мои обмены
						</NavLink>
					</li>
					<li>
						<NavLink
							to={ROUTES.EXCHANGE}
							className={styles.navLink}
							onClick={() => setIsMenuOpen(false)}
						>
							Создать обмен
						</NavLink>
					</li>
				</ul>
			}
			actions={
				<div className={styles.actions}>
					<UserSwitcher />
					<ThemeToggle />
				</div>
			}
			mobileMenu={
				<BurgerButton
					isOpen={isMenuOpen}
					onClick={() => setIsMenuOpen(isOpen => !isOpen)}
				/>
			}
		/>
	)
}

export { MainHeader }
