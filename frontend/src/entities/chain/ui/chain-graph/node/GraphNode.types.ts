import type { ChainStep } from '@entities/chain/model/chain.types'
import type { Node, NodeProps, Position } from '@xyflow/react'

export type GraphNodeData = ChainStep & {
	sourcePosition: Position
	targetPosition: Position
}

export type GraphNodeProps = NodeProps<Node<GraphNodeData>>
