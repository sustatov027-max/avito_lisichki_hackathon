import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { Chain } from '@entities/chain/model/chain.types'

import { ChainGraph } from './ChainGraph'

const mocks = vi.hoisted(() => ({
	flowProps: null as Record<string, unknown> | null
}))

vi.mock('@xyflow/react', () => ({
	ReactFlow: (props: Record<string, unknown>) => {
		mocks.flowProps = props
		return <div data-testid='react-flow' />
	},
	Position: { Top: 'top', Right: 'right', Bottom: 'bottom', Left: 'left' },
	MarkerType: { ArrowClosed: 'arrowclosed' }
}))

vi.mock('../node/GraphNode', () => ({
	GraphNode: () => null
}))

vi.mock('@shared/ui', () => ({
	Modal: ({
		children,
		open,
		title
	}: {
		children: React.ReactNode
		open: boolean
		title: string
	}) => (open ? <section aria-label={title}>{children}</section> : null)
}))

const chain = {
	chain_id: 'chain-1',
	status: 'proposed',
	chain_length: 2,
	created_at: '2026-08-09T10:00:00Z',
	expires_at: '2026-08-10T10:00:00Z',
	time_left_seconds: 3600,
	my_summary: {},
	steps: [
		{
			step_order: 1,
			from_user: { id: 'user-1', name: 'Иван', city: 'Москва' },
			to_user: { id: 'user-2', name: 'Ольга', city: 'Казань' },
			item: {
				id: 'item-1',
				title: 'Телефон',
				category_id: '00000000-0000-0000-0000-000000000101',
				photo: '',
				description: '',
				is_accepted: null
			},
			is_accepted: null
		},
		{
			step_order: 2,
			from_user: { id: 'user-2', name: 'Ольга', city: 'Казань' },
			to_user: { id: 'user-1', name: 'Иван', city: 'Москва' },
			item: {
				id: 'item-2',
				title: 'Ноутбук',
				category_id: '00000000-0000-0000-0000-000000000102',
				photo: '',
				description: '',
				is_accepted: null
			},
			is_accepted: null
		}
	]
} as Chain

describe('ChainGraph', () => {
	beforeEach(() => {
		mocks.flowProps = null
	})

	it('builds nodes and directed edges for all chain steps', () => {
		render(<ChainGraph chain={chain} />)

		expect(screen.getByTestId('react-flow')).toBeInTheDocument()
		expect(mocks.flowProps?.nodes).toHaveLength(2)
		expect(mocks.flowProps?.edges).toHaveLength(2)
		expect(mocks.flowProps?.elementsSelectable).toBe(true)
	})

	it('disables node selection for a rejected chain', () => {
		render(<ChainGraph chain={{ ...chain, status: 'rejected' }} />)

		expect(mocks.flowProps?.elementsSelectable).toBe(false)
	})
})
