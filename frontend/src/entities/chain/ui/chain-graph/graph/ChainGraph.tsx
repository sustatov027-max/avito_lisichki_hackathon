import { type Edge, MarkerType, type Node, ReactFlow } from '@xyflow/react'
import { Position } from '@xyflow/react'

import { GraphNode } from '../node/GraphNode'
import type { GraphNodeData } from '../node/GraphNode.types'

import styles from './ChainGraph.module.scss'
import type { ChainGraphProps } from './ChainGraph.types'

import '@xyflow/react/dist/style.css'

const nodeTypes = { chainStep: GraphNode }

const getNodePosition = (index: number, count: number) => {
	if (count === 1) return { x: 0, y: 0 }

	const radius = count === 2 ? 220 : 280
	const angle = (Math.PI * 2 * index) / count - Math.PI / 2

	return {
		x: radius + radius * Math.cos(angle),
		y: radius + radius * Math.sin(angle)
	}
}

const getHandlePosition = (
	from: { x: number; y: number },
	to: { x: number; y: number }
) => {
	const xDifference = to.x - from.x
	const yDifference = to.y - from.y

	if (Math.abs(xDifference) > Math.abs(yDifference)) {
		return xDifference > 0 ? Position.Right : Position.Left
	}

	return yDifference > 0 ? Position.Bottom : Position.Top
}

const ChainGraph = (props: ChainGraphProps) => {
	const { chain } = props
	const positions = new Map(
		chain.steps.map((step, index) => [
			step.step_order,
			getNodePosition(index, chain.steps.length)
		])
	)

	const nodes: Node<GraphNodeData>[] = chain.steps.map((step, index) => {
		const position = getNodePosition(index, chain.steps.length)
		const nextStep = chain.steps.find(
			next => next.from_user.id === step.to_user.id
		)
		const previousStep = chain.steps.find(
			previous => previous.to_user.id === step.from_user.id
		)

		return {
			id: String(step.step_order),
			type: 'chainStep',
			position,
			data: {
				...step,
				sourcePosition: nextStep
					? getHandlePosition(
							position,
							positions.get(nextStep.step_order) ?? position
						)
					: Position.Right,
				targetPosition: previousStep
					? getHandlePosition(
							position,
							positions.get(previousStep.step_order) ?? position
						)
					: Position.Left
			}
		}
	})

	const edges: Edge[] = chain.steps.flatMap(step => {
		const nextStep = chain.steps.find(
			next => next.from_user.id === step.to_user.id
		)

		if (!nextStep) return []

		return {
			id: `step-${step.step_order}-${nextStep.step_order}`,
			source: String(step.step_order),
			target: String(nextStep.step_order),
			markerEnd: { type: MarkerType.ArrowClosed }
		}
	})

	return (
		<div className={styles.graph}>
			<ReactFlow
				nodes={nodes}
				edges={edges}
				nodeTypes={nodeTypes}
				fitView
				fitViewOptions={{ padding: 0.12, maxZoom: 1 }}
				minZoom={0.45}
				maxZoom={1}
				nodesDraggable={false}
				nodesConnectable={false}
				nodesFocusable={false}
				edgesFocusable={false}
				selectionOnDrag={false}
				panOnDrag={false}
				panOnScroll={false}
				zoomOnScroll={false}
				zoomOnPinch={false}
				zoomOnDoubleClick={false}
			/>
		</div>
	)
}

export { ChainGraph }
