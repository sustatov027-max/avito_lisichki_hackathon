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
        '20000000-0000-0000-0000-000000000001', 45000,
        ARRAY['https://example.com/seed/bicycle.jpg'],
        '[{"attribute_id":"condition","value":"good"},{"attribute_id":"brand","value":"STELS"}]'::jsonb, 
        'active'
    ),
    (
        '30000000-0000-0000-0000-000000000002',
        '10000000-0000-0000-0000-000000000002',
        'Москва', TRUE, 'Игровая приставка', 'Тестовая приставка Марии',
        '20000000-0000-0000-0000-000000000002', 40000,
        ARRAY['https://example.com/seed/console.jpg'],
        '[{"attribute_id":"condition","value":"like_new"},{"attribute_id":"brand","value":"Sony"}]'::jsonb, 
        'active'
    ),
    (
        '30000000-0000-0000-0000-000000000003',
        '10000000-0000-0000-0000-000000000003',
        'Казань', TRUE, 'Смартфон', 'Тестовый смартфон Ивана',
        '20000000-0000-0000-0000-000000000003', 42000,
        ARRAY['https://example.com/seed/phone.jpg'],
        '[{"attribute_id":"memory","value":256},{"attribute_id":"brand","value":"Xiaomi"}]'::jsonb, 
        'active'
    )
ON CONFLICT (id) DO NOTHING;

-- 3. Желаемые товары (desired_items)
INSERT INTO desired_items (
    id, offered_item_id, title_pattern, category_id, min_price, max_price, allow_delivery, attributes
)
VALUES
    -- Алексей ищет приставку в идеальном состоянии
    (
        '40000000-0000-0000-0000-000000000001', 
        '30000000-0000-0000-0000-000000000001', 
        'Игровая приставка', 
        '20000000-0000-0000-0000-000000000002', 
        35000, 50000, TRUE, 
        '[{"attribute_id":"condition","value":"like_new"}]'::jsonb
    ),
    -- Мария ищет смартфон с памятью от 128 до 512 ГБ
    (
        '40000000-0000-0000-0000-000000000002', 
        '30000000-0000-0000-0000-000000000002', 
        'Смартфон', 
        '20000000-0000-0000-0000-000000000003', 
        35000, 50000, TRUE, 
        '[{"attribute_id":"memory","value":{"min":128,"max":512}}]'::jsonb
    ),
    -- Иван ищет велосипед (состояние new или good)
    (
        '40000000-0000-0000-0000-000000000003', 
        '30000000-0000-0000-0000-000000000003', 
        'Горный велосипед', 
        '20000000-0000-0000-0000-000000000001', 
        35000, 50000, TRUE, 
        '[{"attribute_id":"condition","value":["new","good"]}]'::jsonb
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