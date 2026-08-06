import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Input } from './Input'

describe('Input', () => {
	it('blocks non-numeric keys for number input', () => {
		render(<Input aria-label='Цена' type='number' />)
		const input = screen.getByRole('spinbutton', { name: 'Цена' })
		const event = new KeyboardEvent('keydown', { key: 'a', bubbles: true, cancelable: true })

		input.dispatchEvent(event)

		expect(event.defaultPrevented).toBe(true)
	})

	it('allows numeric keys for number input', () => {
		render(<Input aria-label='Цена' type='number' />)
		const input = screen.getByRole('spinbutton', { name: 'Цена' })
		const event = new KeyboardEvent('keydown', { key: '5', bubbles: true, cancelable: true })

		input.dispatchEvent(event)

		expect(event.defaultPrevented).toBe(false)
	})

	it('keeps user onKeyDown handler', () => {
		const onKeyDown = () => undefined
		render(<Input aria-label='Поле' onKeyDown={onKeyDown} />)

		expect(() => fireEvent.keyDown(screen.getByRole('textbox', { name: 'Поле' }))).not.toThrow()
	})
})
