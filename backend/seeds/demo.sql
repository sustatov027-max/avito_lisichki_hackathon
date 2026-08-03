
-- 1. ПОЛЬЗОВАТЕЛИ
INSERT INTO users (id, username, email, password_hash) VALUES 
    ('11111111-1111-1111-1111-111111111111', 'alex_smith', 'alex@example.com', 'hash_password_123'),
    ('22222222-2222-2222-2222-222222222222', 'maria_jones', 'maria@example.com', 'hash_password_456'),
    ('33333333-3333-3333-3333-333333333333', 'ivan_petrov', 'ivan@example.com', 'hash_password_789');

-- 2. КАТЕГОРИИ

-- Уровень 0 (корневые)
INSERT INTO categories (id, parent_id, name, description, level) VALUES 
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NULL, 'Спорт', 'Спортивные товары и инвентарь', 0),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', NULL, 'Электроника', 'Электронные устройства и гаджеты', 0);

-- Уровень 1 (подкатегории)
INSERT INTO categories (id, parent_id, name, description, level) VALUES 
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Мячи', 'Мячи для различных видов спорта', 1),
    ('qqqqqqqq-qqqq-qqqq-qqqq-qqqqqqqqqqqq', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Смартфоны', 'Мобильные телефоны', 1);

-- Уровень 2 (подкатегории Мячей)
INSERT INTO categories (id, parent_id, name, description, level) VALUES 
    ('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Футбольные мячи', 'Мячи для футбола', 2),
    ('iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Баскетбольные мячи', 'Мячи для баскетбола', 2);

-- 3. АТРИБУТЫ КАТЕГОРИЙ

-- 3.1 Атрибуты для "Мячи"
INSERT INTO category_attributes (id, category_id, code, name, value_type, required, filterable, unit) VALUES 
    ('a0000000-0000-0000-0000-000000000001', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'brand', 'Бренд', 'string', false, true, NULL),
    ('a0000000-0000-0000-0000-000000000002', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'size', 'Размер', 'string', true, true, NULL),
    ('a0000000-0000-0000-0000-000000000003', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'material', 'Материал', 'string', false, true, NULL),
    ('a0000000-0000-0000-0000-000000000004', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'weight', 'number', false, true, 'кг');

-- 3.2 Атрибуты для "Футбольные мячи"
INSERT INTO category_attributes (id, category_id, code, name, value_type, required, filterable, unit) VALUES 
    ('b0000000-0000-0000-0000-000000000001', 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'surface_type', 'Тип покрытия', 'string', true, true, NULL),
    ('b0000000-0000-0000-0000-000000000002', 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'certification', 'Сертификация', 'string', false, true, NULL),
    ('b0000000-0000-0000-0000-000000000003', 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'pressure', 'number', false, true, 'atm');

-- 3.3 Атрибуты для "Баскетбольные мячи"
INSERT INTO category_attributes (id, category_id, code, name, value_type, required, filterable, unit) VALUES 
    ('c0000000-0000-0000-0000-000000000001', 'iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', 'surface_type', 'Тип покрытия', 'string', true, true, NULL),
    ('c0000000-0000-0000-0000-000000000002', 'iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', 'ball_type', 'Тип мяча', 'string', true, true, NULL);

-- 3.4 Атрибуты для "Смартфоны"
INSERT INTO category_attributes (id, category_id, code, name, value_type, required, filterable, unit) VALUES 
    ('e0000000-0000-0000-0000-000000000001', 'qqqqqqqq-qqqq-qqqq-qqqq-qqqqqqqqqqqq', 'brand', 'Бренд', 'string', false, true, NULL),
    ('e0000000-0000-0000-0000-000000000002', 'qqqqqqqq-qqqq-qqqq-qqqq-qqqqqqqqqqqq', 'screen_size', 'number', true, true, 'дюймы'),
    ('e0000000-0000-0000-0000-000000000003', 'qqqqqqqq-qqqq-qqqq-qqqq-qqqqqqqqqqqq', 'storage', 'number', true, true, 'ГБ'),
    ('e0000000-0000-0000-0000-000000000004', 'qqqqqqqq-qqqq-qqqq-qqqq-qqqqqqqqqqqq', 'ram', 'number', true, true, 'ГБ'),
    ('e0000000-0000-0000-0000-000000000005', 'qqqqqqqq-qqqq-qqqq-qqqq-qqqqqqqqqqqq', 'color', 'string', false, true, NULL);


-- 4. ЗНАЧЕНИЯ ДЛЯ ENUM-АТРИБУТОВ

-- 4.1 Для surface_type (футбольные мячи)
INSERT INTO attribute_values (attribute_id, value, sort_order) VALUES 
    ('b0000000-0000-0000-0000-000000000001', 'grass', 1),
    ('b0000000-0000-0000-0000-000000000001', 'indoor', 2),
    ('b0000000-0000-0000-0000-000000000001', 'universal', 3),
    ('b0000000-0000-0000-0000-000000000001', 'artificial_grass', 4);

-- 4.2 Для certification (футбольные мячи)
INSERT INTO attribute_values (attribute_id, value, sort_order) VALUES 
    ('b0000000-0000-0000-0000-000000000002', 'FIFA Quality', 1),
    ('b0000000-0000-0000-0000-000000000002', 'FIFA Quality Pro', 2),
    ('b0000000-0000-0000-0000-000000000002', 'IMS', 3);

-- 4.3 Для surface_type (баскетбольные мячи)
INSERT INTO attribute_values (attribute_id, value, sort_order) VALUES 
    ('c0000000-0000-0000-0000-000000000001', 'indoor', 1),
    ('c0000000-0000-0000-0000-000000000001', 'outdoor', 2),
    ('c0000000-0000-0000-0000-000000000001', 'universal', 3);

-- 4.4 Для ball_type (баскетбольные мячи)
INSERT INTO attribute_values (attribute_id, value, sort_order) VALUES 
    ('c0000000-0000-0000-0000-000000000002', 'professional', 1),
    ('c0000000-0000-0000-0000-000000000002', 'amateur', 2),
    ('c0000000-0000-0000-0000-000000000002', 'kids', 3);

-- 4.5 Для color (смартфоны)
INSERT INTO attribute_values (attribute_id, value, sort_order) VALUES 
    ('e0000000-0000-0000-0000-000000000005', 'Black', 1),
    ('e0000000-0000-0000-0000-000000000005', 'White', 2),
    ('e0000000-0000-0000-0000-000000000005', 'Silver', 3),
    ('e0000000-0000-0000-0000-000000000005', 'Gold', 4),
    ('e0000000-0000-0000-0000-000000000005', 'Blue', 5),
    ('e0000000-0000-0000-0000-000000000005', 'Red', 6),
    ('e0000000-0000-0000-0000-000000000005', 'Green', 7),
    ('e0000000-0000-0000-0000-000000000005', 'Purple', 8);