import { AnimatePresence, motion } from 'framer-motion'

import styles from './Preloader.module.scss'
import type { PreloaderProps } from './Preloader.types'

const Preloader = (props: PreloaderProps) => {
	const { isLoading, label = 'Загрузка страницы' } = props

	return (
		<AnimatePresence>
			{isLoading && (
				<motion.div
					key='preloader'
					initial={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.3 }}
					className={styles.preloader}
					role='status'
					aria-label={label}
				>
					<span className={styles.dots} aria-hidden='true'>
						<span />
						<span />
						<span />
					</span>
				</motion.div>
			)}
		</AnimatePresence>
	)
}

export { Preloader }
