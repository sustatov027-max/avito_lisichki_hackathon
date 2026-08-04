export const CATEGORIES = [
	{
		id: 100,
		name: 'Электроника',
		parentId: null
	},
	{
		id: 101,
		name: 'Смартфоны',
		parentId: 100
	},
	{
		id: 102,
		name: 'Ноутбуки',
		parentId: 100
	},
	{
		id: 103,
		name: 'Планшеты',
		parentId: 100
	},

	{
		id: 200,
		name: 'Транспорт',
		parentId: null
	},
	{
		id: 201,
		name: 'Автомобили',
		parentId: 200
	},
	{
		id: 202,
		name: 'Мотоциклы',
		parentId: 200
	},
	{
		id: 203,
		name: 'Велосипеды',
		parentId: 200
	},

	{
		id: 300,
		name: 'Недвижимость',
		parentId: null
	},
	{
		id: 301,
		name: 'Квартиры',
		parentId: 300
	},
	{
		id: 302,
		name: 'Дома',
		parentId: 300
	},

	{
		id: 400,
		name: 'Одежда',
		parentId: null
	},
	{
		id: 401,
		name: 'Кроссовки',
		parentId: 400
	}
] as const
