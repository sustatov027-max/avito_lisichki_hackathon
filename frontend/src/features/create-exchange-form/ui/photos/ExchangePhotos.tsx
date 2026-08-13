import { AnimatePresence, motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@shared/ui'

import styles from './ExchangePhotos.module.scss'
import type {
	ExchangePhotoProps,
	ExchangePhotosProps
} from './ExchangePhotos.types'

const ExchangePhoto = (props: ExchangePhotoProps) => {
	const { photo, index, onRemove } = props
	const [previewUrl] = useState(() => URL.createObjectURL(photo))

	useEffect(() => () => URL.revokeObjectURL(previewUrl), [previewUrl])

	return (
		<motion.figure
			className={styles.photo}
			layout
			initial={{ opacity: 0, scale: 0.98 }}
			animate={{ opacity: 1, scale: 1 }}
			exit={{ opacity: 0, scale: 0.98 }}
			transition={{ duration: 0.2 }}
		>
			<img src={previewUrl} alt={`Фотография товара ${index + 1}`} />
			<figcaption>{index + 1}</figcaption>
			<Button
				type='button'
				variant='secondary'
				size='sm'
				onlyIcon
				ariaLabel={`Удалить фотографию ${index + 1}`}
				className={styles.removeButton}
				onClick={() => onRemove(index)}
			>
				<Trash2 size={16} aria-hidden='true' />
			</Button>
		</motion.figure>
	)
}

const ExchangePhotos = (props: ExchangePhotosProps) => {
	const { photos, onRemove } = props

	if (!photos.length) return null

	return (
		<div className={styles.gallery}>
			<AnimatePresence>
				{photos.map((photo, index) => (
					<ExchangePhoto
						key={`${photo.name}-${photo.size}-${photo.lastModified}`}
						photo={photo}
						index={index}
						onRemove={onRemove}
					/>
				))}
			</AnimatePresence>
		</div>
	)
}

export { ExchangePhotos }
