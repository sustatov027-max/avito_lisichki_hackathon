import type { User } from '@shared/constants/mock-users'

export type CurrentUserStoreState = {
	user: User | null
	setUser: (userId: string) => void
	clear: () => void
}
