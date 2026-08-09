import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AcceptButton } from './accept/AcceptButton'
import { RejectButton } from './reject/RejectButton'

const mocks = vi.hoisted(() => ({
	accept: vi.fn(),
	reject: vi.fn(),
	isAcceptPending: false,
	isRejectPending: false
}))

vi.mock('@features/chain-decision', () => ({
	useChainDecision: () => mocks
}))

describe('chain decision buttons', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		mocks.isAcceptPending = false
		mocks.isRejectPending = false
	})

	it('accepts the provided chain id', () => {
		render(<AcceptButton chainId='chain-1' />)
		fireEvent.click(screen.getByRole('button', { name: 'Согласиться' }))

		expect(mocks.accept).toHaveBeenCalledWith('chain-1')
	})

	it('rejects the provided chain id', () => {
		render(<RejectButton chainId='chain-1' />)
		fireEvent.click(screen.getByRole('button', { name: 'Отказаться' }))

		expect(mocks.reject).toHaveBeenCalledWith('chain-1')
	})

	it('disables buttons when a decision is pending or externally disabled', () => {
		mocks.isAcceptPending = true
		mocks.isRejectPending = true
		render(
			<>
				<AcceptButton chainId='chain-1' />
				<RejectButton chainId='chain-1' disabled />
			</>
		)

		expect(screen.getByRole('button', { name: 'Согласиться' })).toBeDisabled()
		expect(screen.getByRole('button', { name: 'Отказаться' })).toBeDisabled()
	})
})
