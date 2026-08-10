export type User = {
	userId: string
	name: string
	email: string
	phoneNumber: string
}

export const USERS: User[] = [
	{
		userId: '10000000-0000-0000-0000-000000000001',
		name: 'Алексей',
		email: 'seed.alexey@example.com',
		phoneNumber: '+79990000001'
	},
	{
		userId: '10000000-0000-0000-0000-000000000002',
		name: 'Мария',
		email: 'seed.maria@example.com',
		phoneNumber: '+79990000002'
	},
	{
		userId: '10000000-0000-0000-0000-000000000003',
		name: 'Иван',
		email: 'seed.ivan@example.com',
		phoneNumber: '+79990000003'
	},
	{
		userId: '10000000-0000-0000-0000-000000000004',
		name: 'Дмитрий',
		email: 'seed.dmitry@example.com',
		phoneNumber: '+79990000004'
	}
]
