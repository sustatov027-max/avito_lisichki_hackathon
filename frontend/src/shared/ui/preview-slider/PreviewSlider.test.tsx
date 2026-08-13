import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { PreviewSlider } from './PreviewSlider'

const images = ['first.jpg', 'second.jpg', 'third.jpg']

describe('PreviewSlider', () => {
	it('changes slides according to the cursor position on desktop', () => {
		const { container } = render(<PreviewSlider images={images} />)
		const slider = container.firstElementChild as HTMLDivElement
		const pointerMove = new MouseEvent('pointermove', {
			bubbles: true,
			clientX: 250
		})

		Object.defineProperty(pointerMove, 'pointerType', { value: 'mouse' })
		Object.defineProperty(slider, 'getBoundingClientRect', {
			value: () => ({ left: 0, width: 300 })
		})

		fireEvent(slider, pointerMove)

		const slides = container.querySelectorAll('.swiper-slide')
		expect(slides[2]).toHaveClass('swiper-slide-active')
	})

	it('does not switch slides by cursor on mobile', () => {
		const initialWidth = window.innerWidth
		Object.defineProperty(window, 'innerWidth', {
			configurable: true,
			value: 767
		})

		const { container } = render(<PreviewSlider images={images} />)
		const slider = container.firstElementChild as HTMLDivElement
		const pointerMove = new MouseEvent('pointermove', {
			bubbles: true,
			clientX: 250
		})

		Object.defineProperty(pointerMove, 'pointerType', { value: 'mouse' })
		Object.defineProperty(slider, 'getBoundingClientRect', {
			value: () => ({ left: 0, width: 300 })
		})

		fireEvent(slider, pointerMove)

		const slides = container.querySelectorAll('.swiper-slide')
		expect(slides[0]).toHaveClass('swiper-slide-active')

		Object.defineProperty(window, 'innerWidth', {
			configurable: true,
			value: initialWidth
		})
	})
})
