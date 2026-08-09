const currentDate = new Date()

export const ATTRIBUTES = [
	// Смартфоны
	{
		id: '00000000-0000-4000-8000-000000000001',
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
		id: '00000000-0000-4000-8000-000000000002',
		categoryId: '00000000-0000-0000-0000-000000000101',
		name: 'storage',
		label: 'Память',
		type: 'range',
		min: 64,
		max: 1024
	},
	{
		id: '00000000-0000-4000-8000-000000000003',
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
		id: '00000000-0000-4000-8000-000000000004',
		categoryId: '00000000-0000-0000-0000-000000000102',
		name: 'ram',
		label: 'Оперативная память',
		type: 'range',
		min: 4,
		max: 128
	},
	{
		id: '00000000-0000-4000-8000-000000000005',
		categoryId: '00000000-0000-0000-0000-000000000102',
		name: 'storage',
		label: 'SSD',
		type: 'range',
		min: 128,
		max: 4096
	},
	{
		id: '00000000-0000-4000-8000-000000000006',
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
		id: '00000000-0000-4000-8000-000000000007',
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
		id: '00000000-0000-4000-8000-000000000008',
		categoryId: '00000000-0000-0000-0000-000000000201',
		name: 'year',
		label: 'Год выпуска',
		type: 'range',
		min: 1950,
		max: currentDate.getFullYear()
	},
	{
		id: '00000000-0000-4000-8000-000000000009',
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
		id: '00000000-0000-4000-8000-000000000010',
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
	},

	// Планшеты
	{
		id: '00000000-0000-4000-8000-000000000011',
		categoryId: '00000000-0000-0000-0000-000000000103',
		name: 'brand',
		label: 'Бренд',
		type: 'select',
		options: [
			{ name: 'Apple', label: 'Apple' },
			{ name: 'Samsung', label: 'Samsung' },
			{ name: 'Lenovo', label: 'Lenovo' },
			{ name: 'Xiaomi', label: 'Xiaomi' }
		]
	},
	{
		id: '00000000-0000-4000-8000-000000000012',
		categoryId: '00000000-0000-0000-0000-000000000103',
		name: 'storage',
		label: 'Память',
		type: 'range',
		min: 32,
		max: 1024
	},
	{
		id: '00000000-0000-4000-8000-000000000013',
		categoryId: '00000000-0000-0000-0000-000000000103',
		name: 'screen_size',
		label: 'Диагональ экрана (дюймы)',
		type: 'range',
		min: 7,
		max: 15
	},
	{
		id: '00000000-0000-4000-8000-000000000014',
		categoryId: '00000000-0000-0000-0000-000000000103',
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

	// Мотоциклы
	{
		id: '00000000-0000-4000-8000-000000000015',
		categoryId: '00000000-0000-0000-0000-000000000202',
		name: 'year',
		label: 'Год выпуска',
		type: 'range',
		min: 1950,
		max: currentDate.getFullYear()
	},
	{
		id: '00000000-0000-4000-8000-000000000016',
		categoryId: '00000000-0000-0000-0000-000000000202',
		name: 'engine_volume',
		label: 'Объём двигателя (см³)',
		type: 'range',
		min: 50,
		max: 2500
	},
	{
		id: '00000000-0000-4000-8000-000000000017',
		categoryId: '00000000-0000-0000-0000-000000000202',
		name: 'type',
		label: 'Тип',
		type: 'select',
		options: [
			{ name: 'sport', label: 'Спортбайк' },
			{ name: 'cruiser', label: 'Круизер' },
			{ name: 'enduro', label: 'Эндуро' },
			{ name: 'scooter', label: 'Скутер' }
		]
	},
	{
		id: '00000000-0000-4000-8000-000000000018',
		categoryId: '00000000-0000-0000-0000-000000000202',
		name: 'condition',
		label: 'Состояние',
		type: 'select',
		options: [
			{ name: 'new', label: 'Новое' },
			{ name: 'good', label: 'Хорошее' },
			{ name: 'used', label: 'Б/у' }
		]
	},

	// Велосипеды
	{
		id: '00000000-0000-4000-8000-000000000019',
		categoryId: '00000000-0000-0000-0000-000000000203',
		name: 'type',
		label: 'Тип',
		type: 'select',
		options: [
			{ name: 'mountain', label: 'Горный' },
			{ name: 'road', label: 'Шоссейный' },
			{ name: 'city', label: 'Городской' },
			{ name: 'bmx', label: 'BMX' },
			{ name: 'electric', label: 'Электровелосипед' }
		]
	},
	{
		id: '00000000-0000-4000-8000-000000000020',
		categoryId: '00000000-0000-0000-0000-000000000203',
		name: 'wheel_size',
		label: 'Размер колёс (дюймы)',
		type: 'select',
		options: [
			{ name: '24', label: '24' },
			{ name: '26', label: '26' },
			{ name: '27_5', label: '27.5' },
			{ name: '28', label: '28' },
			{ name: '29', label: '29' }
		]
	},
	{
		id: '00000000-0000-4000-8000-000000000021',
		categoryId: '00000000-0000-0000-0000-000000000203',
		name: 'frame_material',
		label: 'Материал рамы',
		type: 'select',
		options: [
			{ name: 'aluminum', label: 'Алюминий' },
			{ name: 'steel', label: 'Сталь' },
			{ name: 'carbon', label: 'Карбон' }
		]
	},

	// Квартиры и дома
	{
		id: '00000000-0000-4000-8000-000000000022',
		categoryId: '00000000-0000-0000-0000-000000000301',
		name: 'rooms',
		label: 'Количество комнат',
		type: 'range',
		min: 1,
		max: 10
	},
	{
		id: '00000000-0000-4000-8000-000000000023',
		categoryId: '00000000-0000-0000-0000-000000000301',
		name: 'area',
		label: 'Площадь (м²)',
		type: 'range',
		min: 10,
		max: 1000
	},
	{
		id: '00000000-0000-4000-8000-000000000024',
		categoryId: '00000000-0000-0000-0000-000000000301',
		name: 'condition',
		label: 'Состояние',
		type: 'select',
		options: [
			{ name: 'new', label: 'Новостройка' },
			{ name: 'renovated', label: 'С ремонтом' },
			{ name: 'needs_renovation', label: 'Требует ремонта' }
		]
	},
	{
		id: '00000000-0000-4000-8000-000000000025',
		categoryId: '00000000-0000-0000-0000-000000000302',
		name: 'area',
		label: 'Площадь дома (м²)',
		type: 'range',
		min: 20,
		max: 5000
	},
	{
		id: '00000000-0000-4000-8000-000000000026',
		categoryId: '00000000-0000-0000-0000-000000000302',
		name: 'land_area',
		label: 'Площадь участка (сотки)',
		type: 'range',
		min: 1,
		max: 500
	},
	{
		id: '00000000-0000-4000-8000-000000000027',
		categoryId: '00000000-0000-0000-0000-000000000302',
		name: 'material',
		label: 'Материал дома',
		type: 'select',
		options: [
			{ name: 'brick', label: 'Кирпич' },
			{ name: 'wood', label: 'Дерево' },
			{ name: 'block', label: 'Блоки' },
			{ name: 'frame', label: 'Каркасный' }
		]
	},

	// Кроссовки
	{
		id: '00000000-0000-4000-8000-000000000028',
		categoryId: '00000000-0000-0000-0000-000000000401',
		name: 'size',
		label: 'Размер (RU)',
		type: 'range',
		min: 35,
		max: 48
	},
	{
		id: '00000000-0000-4000-8000-000000000029',
		categoryId: '00000000-0000-0000-0000-000000000401',
		name: 'brand',
		label: 'Бренд',
		type: 'select',
		options: [
			{ name: 'Nike', label: 'Nike' },
			{ name: 'Adidas', label: 'Adidas' },
			{ name: 'Puma', label: 'Puma' },
			{ name: 'New Balance', label: 'New Balance' }
		]
	},
	{
		id: '00000000-0000-4000-8000-000000000030',
		categoryId: '00000000-0000-0000-0000-000000000401',
		name: 'gender',
		label: 'Пол',
		type: 'select',
		options: [
			{ name: 'men', label: 'Мужские' },
			{ name: 'women', label: 'Женские' },
			{ name: 'unisex', label: 'Унисекс' }
		]
	},
	{
		id: '00000000-0000-4000-8000-000000000031',
		categoryId: '00000000-0000-0000-0000-000000000401',
		name: 'condition',
		label: 'Состояние',
		type: 'select',
		options: [
			{ name: 'new', label: 'Новое' },
			{ name: 'like_new', label: 'Как новое' },
			{ name: 'used', label: 'Б/у' }
		]
	}
] as const
