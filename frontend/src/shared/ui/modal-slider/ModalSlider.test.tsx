import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ModalSlider } from './ModalSlider'

const images = ['first.jpg', 'second.jpg', 'third.jpg']

describe('ModalSlider', () => {
	it('switches images with navigation buttons', () => {
		const { container } = render(
			<ModalSlider images={images} imageAlt='Товар' />
		)

		fireEvent.click(
			screen.getByRole('button', { name: 'Следующее изображение' })
		)

		const slides = container.querySelectorAll('.swiper-slide')
		expect(slides[1]).toHaveClass('swiper-slide-active')
	})

	it('switches images with pagination', () => {
		const { container } = render(
			<ModalSlider images={images} imageAlt='Товар' />
		)

		fireEvent.click(
			screen.getByRole('button', { name: 'Показать изображение 3' })
		)

		const slides = container.querySelectorAll('.swiper-slide')
		expect(slides[2]).toHaveClass('swiper-slide-active')
	})

	it('renders a placeholder without images', () => {
		const { container } = render(<ModalSlider images={[]} imageAlt='Товар' />)

		expect(container.querySelector('.swiper')).not.toBeInTheDocument()
	})
})
