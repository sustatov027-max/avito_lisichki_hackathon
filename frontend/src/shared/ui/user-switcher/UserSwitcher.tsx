import { USERS } from '@shared/constants/mock-users'
import { useCurrentUserStore } from '@shared/model/current-user.store'
import {
	Dropdown,
	DropdownContent,
	DropdownRadioGroup,
	DropdownRadioItem,
	DropdownTrigger
} from '@shared/ui'

const UserSwitcher = () => {
	const user = useCurrentUserStore(state => state.user)
	const setUser = useCurrentUserStore(state => state.setUser)
	const clearUser = useCurrentUserStore(state => state.clear)

	return (
		<Dropdown>
			<DropdownTrigger type='button'>
				{user?.name ?? 'Выберите пользователя'}
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
