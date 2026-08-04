export const ATTRIBUTES = [
	// Смартфоны
	{
		id: '1',
		categoryId: '00000000-0000-0000-0000-000000000101',
		name: 'color',
		label: 'Цвет',
		type: 'multiple-select',
		options: [
			{ name: 'black', label: 'Черный' },
			{ name: 'white', label: 'Белый' },
			{ name: 'blue', label: 'Синий' },
			{ name: 'gray', label: 'Серый' },
			{ name: 'gold', label: 'Золотой' }
		]
	},
	{
		id: '2',
		categoryId: '00000000-0000-0000-0000-000000000101',
		name: 'storage',
		label: 'Память',
		type: 'range',
		min: 64,
		max: 1024
	},
	{
		id: '3',
		categoryId: '00000000-0000-0000-0000-000000000101',
		name: 'condition',
		label: 'Состояние',
		type: 'select',
		options: [
			{ name: 'new', label: 'Новое' },
			{ name: 'like_new', label: 'Как новое' },
			{ name: 'good', label: 'Хорошее' },
			{ name: 'used', label: 'Б/у' }
		]
	},

	// Ноутбуки
	{
		id: '10',
		categoryId: '00000000-0000-0000-0000-000000000102',
		name: 'ram',
		label: 'Оперативная память',
		type: 'range',
		min: 4,
		max: 128
	},
	{
		id: '11',
		categoryId: '00000000-0000-0000-0000-000000000102',
		name: 'storage',
		label: 'SSD',
		type: 'range',
		min: 128,
		max: 4096
	},
	{
		id: '12',
		categoryId: '00000000-0000-0000-0000-000000000102',
		name: 'brand',
		label: 'Бренд',
		type: 'select',
		options: [
			{ name: 'Apple', label: 'Apple' },
			{ name: 'ASUS', label: 'ASUS' },
			{ name: 'Lenovo', label: 'Lenovo' },
			{ name: 'Dell', label: 'Dell' }
		]
	},
	{
		id: '13',
		categoryId: '00000000-0000-0000-0000-000000000102',
		name: 'color',
		label: 'Цвет',
		type: 'multiple-select',
		options: [
			{ name: 'black', label: 'Черный' },
			{ name: 'silver', label: 'Серебристый' },
			{ name: 'gray', label: 'Серый' }
		]
	},

	// Автомобили
	{
		id: '20',
		categoryId: '00000000-0000-0000-0000-000000000201',
		name: 'year',
		label: 'Год выпуска',
		type: 'range',
		min: 1950,
		max: 2026
	},
	{
		id: '21',
		categoryId: '00000000-0000-0000-0000-000000000201',
		name: 'transmission',
		label: 'Коробка',
		type: 'select',
		options: [
			{ name: 'automatic', label: 'Автомат' },
			{ name: 'manual', label: 'Механика' }
		]
	},
	{
		id: '22',
		categoryId: '00000000-0000-0000-0000-000000000201',
		name: 'fuel',
		label: 'Топливо',
		type: 'multiple-select',
		options: [
			{ name: 'gasoline', label: 'Бензин' },
			{ name: 'diesel', label: 'Дизель' },
			{ name: 'hybrid', label: 'Гибрид' },
			{ name: 'electric', label: 'Электро' }
		]
	}
] as const
