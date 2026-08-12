import { describe, expect, it } from 'vitest'

import { getChainById } from './chain.helpers'
import type { Chain } from './chain.types'

const chains = [{ chain_id: 'chain-1' }, { chain_id: 'chain-2' }] as Chain[]

describe('getChainById', () => {
	it('returns the chain with the requested id', () => {
		expect(getChainById('chain-2', chains)).toBe(chains[1])
	})

	it('returns undefined when the requested chain is absent', () => {
		expect(getChainById('unknown', chains)).toBeUndefined()
	})

	it('returns null before chains are loaded', () => {
		expect(getChainById('chain-1', null)).toBeNull()
	})
})
