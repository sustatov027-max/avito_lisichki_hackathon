import { useParams } from 'react-router'

import { ChainDetails } from '@widgets/chain-details'

import { useChain } from '@entities/chain'
import { ChainTimer } from '@entities/chain/ui/chain-timer/ChainTimer'

import { Section } from '@shared/ui/section'

const Chain = () => {
	const { chainId } = useParams()

	const { chain } = useChain(chainId as string)

	const sectionActions = chain && (
		<>
			<ChainTimer seconds={chain?.time_left_seconds} />
		</>
	)

	return (
		<Section
			title='Цепочка обмена'
			id='exchange-chain'
			actions={sectionActions}
		>
			{chainId && <ChainDetails chainId={chainId as string} chain={chain} />}
		</Section>
	)
}

export { Chain }
