import type { ChainsResponse } from './chain.types'

export const CHAIN = {
	chains: [
		{
			chain_id: 'a3b8e91c-7d2f-4e8a-9123-5c8a1b2c3d4e',
			status: 'proposed',
			chain_length: 3,
			created_at: '2026-08-04T07:00:00Z',
			expires_at: '2026-08-05T07:00:00Z',
			time_left_seconds: 82800,

			my_summary: {
				user_action_required: true,
				my_decision: 'pending',
				giving_item: {
					id: '11111111-1111-1111-1111-111111111111',
					title: 'iPhone 15 Pro',
					photo: '<https://cdn.example.com/items/iphone.jpg>',
					estimated_price: 85000.0
				},
				receiving_item: {
					id: '33333333-3333-3333-3333-333333333333',
					title: 'Samsung Galaxy S24',
					photo: '<https://cdn.example.com/items/samsung.jpg>',
					estimated_price: 80000.0,
					from_user: {
						id: 'user-uuid-3',
						name: 'Елена',
						city: 'Москва'
					}
				}
			},

			steps: [
				{
					step_order: 1,
					from_user: {
						id: 'user-uuid-1',
						name: 'Вы (Алексей)',
						city: 'Москва',
						is_me: true
					},
					to_user: {
						id: 'user-uuid-2',
						name: 'Иван',
						city: 'Москва',
						is_me: false
					},
					item: {
						id: '11111111-1111-1111-1111-111111111111',
						title: 'iPhone 15 Pro',
						category_id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
						photo: '<https://cdn.example.com/items/iphone.jpg>'
					},
					is_accepted: true
				},
				{
					step_order: 2,
					from_user: {
						id: 'user-uuid-2',
						name: 'Иван',
						city: 'Москва',
						is_me: false
					},
					to_user: {
						id: 'user-uuid-3',
						name: 'Елена',
						city: 'Москва',
						is_me: false
					},
					item: {
						id: '22222222-2222-2222-2222-222222222222',
						title: 'Электросамокат Ninebot',
						category_id: '2c92017c-17c3-4d43-9828-567482813123',
						photo: '<https://cdn.example.com/items/scooter.jpg>'
					},
					is_accepted: false
				},
				{
					step_order: 3,
					from_user: {
						id: 'user-uuid-3',
						name: 'Елена',
						city: 'Москва',
						is_me: false
					},
					to_user: {
						id: 'user-uuid-1',
						name: 'Вы (Алексей)',
						city: 'Москва',
						is_me: true
					},
					item: {
						id: '33333333-3333-3333-3333-333333333333',
						title: 'Samsung Galaxy S24',
						category_id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
						photo: '<https://cdn.example.com/items/samsung.jpg>'
					},
					is_accepted: null
				}
			]
		}
	]
} satisfies ChainsResponse
