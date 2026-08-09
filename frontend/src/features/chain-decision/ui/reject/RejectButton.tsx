import { useChainDecision } from '@features/chain-decision'

import { Button } from '@shared/ui'

import type { RejectButtonProps } from './RejectButton.types'

const RejectButton = (props: RejectButtonProps) => {
	const { chainId, disabled } = props

	const { reject, isRejectPending } = useChainDecision()

	const onAcceptButtonClick = () => {
		reject(chainId)
	}

	return (
		<Button
			variant='red'
			onClick={onAcceptButtonClick}
			disabled={isRejectPending || disabled}
		>
			Отказаться
		</Button>
	)
}

export { RejectButton }
