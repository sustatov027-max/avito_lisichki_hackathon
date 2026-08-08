export const ROUTES = {
	ROOT: '/',
	EXCHANGE: 'exchange',
	EXCHANGES: 'exchanges',
	CHAIN_ID(id: string) {
		return `chains/${id}`
	}
}
