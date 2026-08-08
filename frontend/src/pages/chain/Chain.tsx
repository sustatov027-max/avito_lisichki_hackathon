import { useParams } from 'react-router'

import { ChainDetails, useChain } from '@entities/chain'

import { Section } from '@shared/ui/section'

const Chain = () => {
	const { chainId } = useParams()

	const { chain } = useChain(chainId ?? null)

	console.log(chain)

	return (
		<Section title='Цепочка обмена' id='exchange-chain' isTitleHide>
			{chain && <ChainDetails chain={chain} />}
		</Section>
	)
}

export { Chain }
