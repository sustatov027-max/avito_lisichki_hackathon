import { useParams } from 'react-router'

import { useChain } from '@entities/chain/api/chains.query'

const Chain = () => {
	const { chainId } = useParams()

	const { chain } = useChain(chainId ?? null)

	console.log(chain)

	return <div></div>
}

export { Chain }
