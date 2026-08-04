export const ATTRIBUTES = [
	// Смартфоны
	{
		id: 1,
		categoryId: 101,
		name: 'color',
		label: 'Цвет',
		type: 'multiple-select',
		options: ['black', 'white', 'blue', 'gray', 'gold']
	},
	{
		id: 2,
		categoryId: 101,
		name: 'storage',
		label: 'Память',
		type: 'range',
		min: 64,
		max: 1024
	},
	{
		id: 3,
		categoryId: 101,
		name: 'condition',
		label: 'Состояние',
		type: 'select',
		options: ['new', 'like_new', 'good', 'used']
	},

	// Ноутбуки
	{
		id: 10,
		categoryId: 102,
		name: 'ram',
		label: 'Оперативная память',
		type: 'range',
		min: 4,
		max: 128
	},
	{
		id: 11,
		categoryId: 102,
		name: 'storage',
		label: 'SSD',
		type: 'range',
		min: 128,
		max: 4096
	},
	{
		id: 12,
		categoryId: 102,
		name: 'brand',
		label: 'Бренд',
		type: 'select',
		options: ['Apple', 'ASUS', 'Lenovo', 'Dell']
	},
	{
		id: 13,
		categoryId: 102,
		name: 'color',
		label: 'Цвет',
		type: 'multiple-select',
		options: ['black', 'silver', 'gray']
	},

	// Автомобили
	{
		id: 20,
		categoryId: 201,
		name: 'year',
		label: 'Год выпуска',
		type: 'range',
		min: 1950,
		max: 2026
	},
	{
		id: 21,
		categoryId: 201,
		name: 'transmission',
		label: 'Коробка',
		type: 'select',
		options: ['automatic', 'manual']
	},
	{
		id: 22,
		categoryId: 201,
		name: 'fuel',
		label: 'Топливо',
		type: 'multiple-select',
		options: ['gasoline', 'diesel', 'hybrid', 'electric']
	}
] as const
