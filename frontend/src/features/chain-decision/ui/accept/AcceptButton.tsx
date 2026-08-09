import { useChainDecision } from '@features/chain-decision'

import { Button } from '@shared/ui'

import type { AcceptButtonProps } from './AcceptButton.types'

const AcceptButton = (props: AcceptButtonProps) => {
	const { chainId } = props

	const { accept, isAcceptPending } = useChainDecision()

	const onAcceptButtonClick = () => {
		accept(chainId)
	}

	return (
		<Button
			variant='green'
			onClick={onAcceptButtonClick}
			disabled={isAcceptPending}
		>
			Согласиться
		</Button>
	)
}

export { AcceptButton }
