import { fireEvent, render, screen } from '@testing-library/react'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import { ExchangePhotos } from './ExchangePhotos'

beforeAll(() => {
	Object.defineProperty(URL, 'createObjectURL', {
		configurable: true,
		value: vi.fn((photo: File) => `blob:${photo.name}`)
	})
	Object.defineProperty(URL, 'revokeObjectURL', {
		configurable: true,
		value: vi.fn()
	})
})

describe('ExchangePhotos', () => {
	it('keeps photo order and allows removing a photo', () => {
		const onRemove = vi.fn()
		const photos = [
			new File(['first'], 'first.jpg', { type: 'image/jpeg' }),
			new File(['second'], 'second.jpg', { type: 'image/jpeg' })
		]

		render(<ExchangePhotos photos={photos} onRemove={onRemove} />)

		expect(screen.getByAltText('Фотография товара 1')).toHaveAttribute(
			'src',
			'blob:first.jpg'
		)
		expect(screen.getByAltText('Фотография товара 2')).toHaveAttribute(
			'src',
			'blob:second.jpg'
		)

		fireEvent.click(
			screen.getByRole('button', { name: 'Удалить фотографию 1' })
		)
		expect(onRemove).toHaveBeenCalledWith(0)
	})
})
