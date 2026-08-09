import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useChainModalStore } from '@entities/chain/model/chain-modal.store'

import { GraphNode } from './GraphNode'
import type { GraphNodeProps } from './GraphNode.types'

vi.mock('@xyflow/react', () => ({
	Handle: () => <span data-testid='handle' />,
	Position: { Top: 'top', Right: 'right', Bottom: 'bottom', Left: 'left' }
}))

const data = {
	item: {
		id: 'item-1',
		title: 'Ноутбук',
		photo: '',
		category_id: 'category-1',
		description: '',
		is_accepted: null
	},
	from_user: { id: 'user-1', name: 'Иван', city: 'Москва' },
	to_user: { id: 'user-2', name: 'Ольга', city: 'Казань' },
	step_order: 1,
	is_accepted: null,
	sourcePosition: 'right',
	targetPosition: 'left'
}

const props = {
	id: 'step-1',
	data,
	type: 'chainStep',
	draggable: false,
	zIndex: 0,
	dragging: false,
	selectable: false,
	deletable: false,
	selected: false,
	isConnectable: false,
	positionAbsoluteX: 0,
	positionAbsoluteY: 0
} as GraphNodeProps

describe('GraphNode', () => {
	beforeEach(() => useChainModalStore.setState({ activeModal: null, modalIds: [] }))

	it('opens details of its item when clicked', () => {
		render(<GraphNode {...props} />)

		fireEvent.click(screen.getByRole('button'))
		expect(useChainModalStore.getState().activeModal).toBe('item-1')
	})

	it('shows the participant decision status', () => {
		const acceptedProps = {
			...props,
			data: { ...data, is_accepted: true }
		} as GraphNodeProps
		render(<GraphNode {...acceptedProps} />)

		expect(screen.getByText('Согласился(ась)')).toBeInTheDocument()
		expect(screen.getByText('Иван')).toBeInTheDocument()
	})
})
