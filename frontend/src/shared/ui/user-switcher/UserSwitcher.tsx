import { UserRound } from 'lucide-react'

import { USERS } from '@shared/constants/mock-users'
import { useCurrentUserStore } from '@shared/model/current-user.store'
import {
	Dropdown,
	DropdownContent,
	DropdownRadioGroup,
	DropdownRadioItem,
	DropdownTrigger
} from '@shared/ui'

import styles from './UserSwitcher.module.scss'

const UserSwitcher = () => {
	const user = useCurrentUserStore(state => state.user)
	const setUser = useCurrentUserStore(state => state.setUser)
	const clearUser = useCurrentUserStore(state => state.clear)

	return (
		<Dropdown>
			<DropdownTrigger
				type='button'
				className={styles.trigger}
				aria-label={user?.name ?? 'Выберите пользователя'}
				title={user?.name ?? 'Выберите пользователя'}
			>
				<UserRound className={styles.icon} size={18} aria-hidden='true' />
				<span className={styles.label}>
					{user?.name ?? 'Выберите пользователя'}
				</span>
			</DropdownTrigger>

			<DropdownContent>
				<DropdownRadioGroup
					value={user?.userId}
					onValueChange={userId => {
						if (userId) {
							setUser(userId)
						} else {
							clearUser()
						}
					}}
				>
					{USERS.map(user => (
						<DropdownRadioItem key={user.userId} value={user.userId}>
							{user.name}
						</DropdownRadioItem>
					))}

					<DropdownRadioItem value={''}>Выйти</DropdownRadioItem>
				</DropdownRadioGroup>
			</DropdownContent>
		</Dropdown>
	)
}

export { UserSwitcher }
