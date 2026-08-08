import { NavLink } from 'react-router'

import { ThemeToggle } from '@features/theme-toggle'

import { ROUTES } from '@shared/constants/routes'
import { Header, Logo } from '@shared/ui'
import { UserSwitcher } from '@shared/ui/user-switcher/UserSwitcher'

import styles from './MainHeader.module.scss'

const MainHeader = () => {
	return (
		<Header
			logo={<Logo />}
			navigation={
				<ul className={styles.navList}>
					<li>
						<NavLink to={ROUTES.EXCHANGES} className={styles.navLink}>
							Мои обмены
						</NavLink>
					</li>
					<li>
						<NavLink to={ROUTES.EXCHANGE} className={styles.navLink}>
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
		/>
	)
}

export { MainHeader }
