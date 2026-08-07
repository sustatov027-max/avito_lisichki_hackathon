import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { USERS } from '@shared/constants/mock-users'
import type { CurrentUserStoreState } from '@shared/model/current-user.store.types'

export const useCurrentUserStore = create<CurrentUserStoreState>()(
	persist(
		set => ({
			user: null,
			setUser: userId =>
				set(() => {
					const findedUser = USERS.find(userItem => userItem.userId === userId)

					return {
						user: findedUser ?? null
					}
				}),
			clear: () => set({ user: null })
		}),
		{
			name: 'user-info'
		}
	)
)
