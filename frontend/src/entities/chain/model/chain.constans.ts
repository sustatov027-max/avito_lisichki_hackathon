import type { ChainStatus } from './chain.types'

export const chainStatusLabels: Record<ChainStatus, string> = {
	proposed: 'Ожидает решений',
	searching: 'Поиск участников',
	accepted: 'Принята',
	completed: 'Обмен завершён',
	expired: 'Срок истёк',
	rejected: 'Отклонена',
	invalidated: 'Отменена'
}

export const terminalStatuses: ChainStatus[] = [
	'accepted',
	'completed',
	'expired',
	'rejected',
	'invalidated'
] 
