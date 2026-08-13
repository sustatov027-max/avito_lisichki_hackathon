import clsx from 'clsx'
import { Package } from 'lucide-react'
import { useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import type { Swiper as SwiperInstance } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'

import styles from './PreviewSlider.module.scss'
import type { PreviewSliderProps } from './PreviewSlider.types'

import 'swiper/css'

const PreviewSlider = (props: PreviewSliderProps) => {
	const { className, images, ...rest } = props
	const swiperRef = useRef<SwiperInstance | null>(null)
	const [activeIndex, setActiveIndex] = useState(0)

	const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
		if (
			images.length < 2 ||
			event.pointerType !== 'mouse' ||
			window.innerWidth <= 767
		)
			return

		const { left, width } = event.currentTarget.getBoundingClientRect()
		if (!width) return

		const index = Math.min(
			images.length - 1,
			Math.max(0, Math.floor(((event.clientX - left) / width) * images.length))
		)

		if (index !== swiperRef.current?.activeIndex) {
			swiperRef.current?.slideTo(index, 0)
		}
	}

	return (
		<div
			{...rest}
			className={clsx(styles.slider, className)}
			onPointerMove={onPointerMove}
			aria-hidden='true'
		>
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
								<img className={styles.image} src={image} alt='' />
							</SwiperSlide>
						))}
					</Swiper>

					{images.length > 1 && (
						<div className={styles.pagination}>
							{images.map((image, index) => (
								<span
									className={clsx(
										styles.dot,
										index === activeIndex && styles.isActive
									)}
									key={`${image}-${index}`}
								/>
							))}
						</div>
					)}
				</>
			) : (
				<Package size={32} strokeWidth={1.6} />
			)}
		</div>
	)
}

export { PreviewSlider }
