SET client_min_messages = warning;

-- 1. Пользователи
INSERT INTO users (id, name, email, phone)
VALUES
    ('10000000-0000-0000-0000-000000000001', 'Алексей', 'seed.alexey@example.com', '+79990000001'),
    ('10000000-0000-0000-0000-000000000002', 'Мария', 'seed.maria@example.com', '+79990000002'),
    ('10000000-0000-0000-0000-000000000003', 'Иван', 'seed.ivan@example.com', '+79990000003'),
    ('10000000-0000-0000-0000-000000000004', 'Дмитрий', 'seed.dmitry@example.com', '+79990000004')
ON CONFLICT (id) DO NOTHING;

-- 2. Предлагаемые товары (offered_items)
INSERT INTO offered_items (
    id, user_id, city_name, delivery_enabled, title, description, category_id, estimated_price, photos, attributes, status
)
VALUES
    (
        '30000000-0000-0000-0000-000000000001',
        '10000000-0000-0000-0000-000000000001',
        'Москва', TRUE, 'Горный велосипед', 'Тестовый велосипед Алексея',
        '00000000-0000-0000-0000-000000000203', 45000,
        ARRAY['https://example.com/seed/bicycle.jpg'],
        '[{"attribute_id":"00000000-0000-4000-8000-000000000019","value":"mountain"},{"attribute_id":"00000000-0000-4000-8000-000000000020","value":"29"},{"attribute_id":"00000000-0000-4000-8000-000000000021","value":"aluminum"}]'::jsonb,
        'active'
    ),
    (
        '30000000-0000-0000-0000-000000000002',
        '10000000-0000-0000-0000-000000000002',
        'Москва', TRUE, 'Смартфон', 'Тестовый смартфон Марии',
        '00000000-0000-0000-0000-000000000101', 40000,
        ARRAY['https://example.com/seed/phone.jpg'],
        '[{"attribute_id":"00000000-0000-4000-8000-000000000001","value":"black"},{"attribute_id":"00000000-0000-4000-8000-000000000002","value":256},{"attribute_id":"00000000-0000-4000-8000-000000000003","value":"like_new"}]'::jsonb,
        'active'
    ),
    (
        '30000000-0000-0000-0000-000000000003',
        '10000000-0000-0000-0000-000000000003',
        'Казань', TRUE, 'Ноутбук', 'Тестовый ноутбук Ивана',
        '00000000-0000-0000-0000-000000000102', 42000,
        ARRAY['https://example.com/seed/laptop.jpg'],
        '[{"attribute_id":"00000000-0000-4000-8000-000000000004","value":16},{"attribute_id":"00000000-0000-4000-8000-000000000005","value":512},{"attribute_id":"00000000-0000-4000-8000-000000000006","value":"ASUS"},{"attribute_id":"00000000-0000-4000-8000-000000000007","value":"gray"}]'::jsonb,
        'active'
    )
ON CONFLICT (id) DO NOTHING;

-- 3. Желаемые товары (desired_items)
INSERT INTO desired_items (
    id, offered_item_id, title_pattern, category_id, min_price, max_price, allow_delivery, attributes
)
VALUES
    (
        '40000000-0000-0000-0000-000000000001',
        '30000000-0000-0000-0000-000000000001',
        'Смартфон',
        '00000000-0000-0000-0000-000000000101',
        35000, 50000, TRUE,
        '[{"attribute_id":"00000000-0000-4000-8000-000000000002","value":{"min":128,"max":512}},{"attribute_id":"00000000-0000-4000-8000-000000000003","value":"like_new"}]'::jsonb
    ),
    (
        '40000000-0000-0000-0000-000000000002',
        '30000000-0000-0000-0000-000000000002',
        'Ноутбук',
        '00000000-0000-0000-0000-000000000102',
        35000, 50000, TRUE,
        '[{"attribute_id":"00000000-0000-4000-8000-000000000006","value":"ASUS"},{"attribute_id":"00000000-0000-4000-8000-000000000007","value":["silver","gray"]}]'::jsonb
    ),
    (
        '40000000-0000-0000-0000-000000000003',
        '30000000-0000-0000-0000-000000000003',
        'Горный велосипед',
        '00000000-0000-0000-0000-000000000203',
        35000, 50000, TRUE,
        '[{"attribute_id":"00000000-0000-4000-8000-000000000019","value":"mountain"},{"attribute_id":"00000000-0000-4000-8000-000000000020","value":"29"}]'::jsonb
    )
ON CONFLICT (id) DO NOTHING;

-- 4. Цепочка обмена
INSERT INTO exchange_chains (id, status, chain_length)
VALUES ('50000000-0000-0000-0000-000000000001', 'proposed', 3)
ON CONFLICT (id) DO NOTHING;

-- 5. Шаги цепочки обмена
INSERT INTO exchange_chain_steps (
    id, chain_id, step_order, from_user_id, to_user_id, offered_item_id, received_item_id, is_accepted
)
VALUES
    ('60000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 1, '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', NULL),
    ('60000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000001', 2, '10000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000003', NULL),
    ('60000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000001', 3, '10000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', NULL)
ON CONFLICT (id) DO NOTHING;

-- Вывод результатов
SELECT '================ DATABASE SEEDED USERS & ATTRIBUTES ================' AS info;
SELECT
    u.name AS user_name,
    oi.title AS offered_item,
    oi.attributes AS offered_attributes,
    di.title_pattern AS wanted_item,
    di.attributes AS wanted_attributes
FROM users u
JOIN offered_items oi ON u.id = oi.user_id
JOIN desired_items di ON oi.id = di.offered_item_id;
SELECT '===================================================================' AS info;