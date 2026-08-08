import { Link } from 'react-router'

import { ThemeToggle } from '@features/theme-toggle'

import logo from '@shared/assets/icons/logo/logo.svg'
import { Header } from '@shared/ui'
import { UserSwitcher } from '@shared/ui/user-switcher/UserSwitcher'

import { ROUTES } from '@shared/constants/routes'

import styles from './MainHeader.module.scss'

const MainHeader = () => {
	return (
		<Header
			logo={
				<Link to={ROUTES.EXCHANGES}>
					<img src={logo} width={60} />
				</Link>
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
