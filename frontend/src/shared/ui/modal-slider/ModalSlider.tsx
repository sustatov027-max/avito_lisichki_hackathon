import clsx from 'clsx'
import { ChevronLeft, ChevronRight, Package } from 'lucide-react'
import { useRef, useState } from 'react'
import type { Swiper as SwiperInstance } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'

import styles from './ModalSlider.module.scss'
import type { ModalSliderProps } from './ModalSlider.types'

import 'swiper/css'

const ModalSlider = (props: ModalSliderProps) => {
	const { className, images, imageAlt, ...rest } = props

	const swiperRef = useRef<SwiperInstance | null>(null)
	const [activeIndex, setActiveIndex] = useState(0)

	const isBeginning = activeIndex === 0
	const isEnd = activeIndex === images.length - 1

	return (
		<div {...rest} className={clsx(styles.slider, className)}>
			{images.length ? (
				<>
					<Swiper
						className={styles.swiper}
						onSwiper={swiper => {
							swiperRef.current = swiper
						}}
						onSlideChange={swiper => setActiveIndex(swiper.activeIndex)}
					>
						{images.map((image, index) => (
							<SwiperSlide className={styles.slide} key={`${image}-${index}`}>
								<img
									className={styles.image}
									src={image}
									alt={`${imageAlt}, фото ${index + 1} из ${images.length}`}
								/>
							</SwiperSlide>
						))}
					</Swiper>

					{images.length > 1 && (
						<>
							<button
								type='button'
								className={clsx(styles.arrow, styles.previous)}
								onClick={() => swiperRef.current?.slidePrev()}
								disabled={isBeginning}
								aria-label='Предыдущее изображение'
							>
								<ChevronLeft aria-hidden='true' />
							</button>
							<button
								type='button'
								className={clsx(styles.arrow, styles.next)}
								onClick={() => swiperRef.current?.slideNext()}
								disabled={isEnd}
								aria-label='Следующее изображение'
							>
								<ChevronRight aria-hidden='true' />
							</button>

							<div className={styles.pagination} aria-label='Выбор изображения'>
								{images.map((image, index) => (
									<button
										type='button'
										className={clsx(
											styles.dot,
											index === activeIndex && styles.isActive
										)}
										onClick={() => swiperRef.current?.slideTo(index)}
										aria-label={`Показать изображение ${index + 1}`}
										aria-current={index === activeIndex ? 'true' : undefined}
										key={`${image}-${index}`}
									/>
								))}
							</div>
						</>
					)}
				</>
			) : (
				<Package size={42} strokeWidth={1.5} aria-hidden='true' />
			)}
		</div>
	)
}

export { ModalSlider }
