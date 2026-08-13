import clsx from 'clsx'
import { ImagePlus } from 'lucide-react'
import { type ChangeEvent, type DragEvent, useRef, useState } from 'react'
import { Controller } from 'react-hook-form'

import type { ExchangeFormComponentsProps } from '@features/create-exchange-form'
import { MAX_EXCHANGE_PHOTOS } from '@features/create-exchange-form/model/create-exchange-form.schema'
import { ExchangePhotos } from '@features/create-exchange-form/ui/photos/ExchangePhotos'

import { FormField, Input } from '@shared/ui'

import styles from './OfferedPhotosField.module.scss'

const getPhotoKey = (photo: File) =>
	`${photo.name}-${photo.size}-${photo.lastModified}`

const OfferedPhotosField = (props: ExchangeFormComponentsProps) => {
	const { form } = props
	const [isDragging, setIsDragging] = useState(false)
	const dragDepth = useRef(0)

	return (
		<FormField name='photos' label='Фотографии товара'>
			<Controller
				control={form.control}
				name='photos'
				render={({ field }) => {
					const photos = field.value ?? []

					const addPhotos = (selectedPhotos: File[]) => {
						const imagePhotos = selectedPhotos.filter(photo =>
							photo.type.startsWith('image/')
						)
						const photoKeys = new Set(photos.map(getPhotoKey))
						const uniquePhotos = imagePhotos.filter(photo => {
							const key = getPhotoKey(photo)

							if (photoKeys.has(key)) return false
							photoKeys.add(key)
							return true
						})
						const nextPhotos = [...photos, ...uniquePhotos]

						field.onChange(nextPhotos.slice(0, MAX_EXCHANGE_PHOTOS))

						if (imagePhotos.length !== selectedPhotos.length) {
							form.setError('photos', {
								type: 'manual',
								message: 'Можно загрузить только изображения'
							})
						} else if (nextPhotos.length > MAX_EXCHANGE_PHOTOS) {
							form.setError('photos', {
								type: 'manual',
								message: `Можно загрузить не больше ${MAX_EXCHANGE_PHOTOS} фотографий`
							})
						}
					}

					const onPhotosChange = (event: ChangeEvent<HTMLInputElement>) => {
						addPhotos(Array.from(event.target.files ?? []))
						event.target.value = ''
					}
					const onDragEnter = (event: DragEvent<HTMLDivElement>) => {
						event.preventDefault()
						dragDepth.current += 1
						setIsDragging(true)
					}
					const onDragLeave = (event: DragEvent<HTMLDivElement>) => {
						event.preventDefault()
						dragDepth.current -= 1

						if (dragDepth.current <= 0) {
							dragDepth.current = 0
							setIsDragging(false)
						}
					}
					const onDrop = (event: DragEvent<HTMLDivElement>) => {
						event.preventDefault()
						dragDepth.current = 0
						setIsDragging(false)
						addPhotos(Array.from(event.dataTransfer.files))
					}

					const onPhotoRemove = (index: number) => {
						field.onChange(photos.filter((_, photoIndex) => photoIndex !== index))
					}

					return (
						<div className={styles.photosField}>
							<div
								className={clsx(
									styles.dropzone,
									isDragging && styles.isDragging
								)}
								onDragEnter={onDragEnter}
								onDragOver={event => event.preventDefault()}
								onDragLeave={onDragLeave}
								onDrop={onDrop}
							>
								<label htmlFor='photos' className={styles.uploadButton}>
									<ImagePlus size={22} aria-hidden='true' />
									<span className={styles.uploadText}>
										<strong>Перетащите фотографии сюда</strong>
										<span>или нажмите, чтобы выбрать</span>
									</span>
									<span className={styles.counter}>
										{photos.length}/{MAX_EXCHANGE_PHOTOS}
									</span>
								</label>
								<Input
									ref={field.ref}
									id='photos'
									name={field.name}
									type='file'
									accept='image/*'
									multiple
									className={styles.fileInput}
									onBlur={field.onBlur}
									onChange={onPhotosChange}
								/>
							</div>
							{!photos.length && (
								<p className={styles.hint}>
									До {MAX_EXCHANGE_PHOTOS} файлов, суммарно не больше 5 МБ
								</p>
							)}
							<ExchangePhotos photos={photos} onRemove={onPhotoRemove} />
						</div>
					)
				}}
			/>
		</FormField>
	)
}

export { OfferedPhotosField }
