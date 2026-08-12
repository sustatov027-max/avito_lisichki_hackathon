import type { Node, NodeProps, Position } from '@xyflow/react'

import type { ChainStep } from '@entities/chain/model/chain.types'

export type GraphNodeData = ChainStep & {
	sourcePosition: Position
	targetPosition: Position
}

export type GraphNodeProps = NodeProps<Node<GraphNodeData>>
