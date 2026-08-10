import { Link } from 'react-router'

import { ROUTES } from '@shared/constants/routes'

import styles from './Logo.module.scss'

const Logo = () => {
	return (
		<Link to={ROUTES.ROOT} className={styles.link}>
			<span>swap</span>
		</Link>
	)
}

export { Logo }
