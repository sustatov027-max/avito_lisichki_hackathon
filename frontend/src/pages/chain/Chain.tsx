import { useParams } from 'react-router'

import { ChainDetails } from '@widgets/chain-details'

import { Section } from '@shared/ui/section'

const Chain = () => {
	const { chainId } = useParams()

	return (
		<Section title='Цепочка обмена' id='exchange-chain'>
			{chainId && <ChainDetails chainId={chainId as string} />}
		</Section>
	)
}

export { Chain }
