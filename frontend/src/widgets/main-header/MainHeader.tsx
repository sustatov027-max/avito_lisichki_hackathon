import { ThemeToggle } from '@features/theme-toggle'

import logo from '@shared/assets/icons/logo/logo.png'
import { Header } from '@shared/ui'
import { UserSwitcher } from '@shared/ui/user-switcher/UserSwitcher'

import styles from './MainHeader.module.scss'

const MainHeader = () => {
	return (
		<Header
			logo={<img src={logo} width={60} />}
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
