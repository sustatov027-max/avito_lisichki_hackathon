-- Функция для проверки, соответствуют ли две вещи критериям матчинга
CREATE OR REPLACE FUNCTION items_match(p_from_item UUID, p_to_item UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM desired_items di
        JOIN offered_items from_oi ON from_oi.id = p_from_item
        JOIN offered_items to_oi   ON to_oi.id   = p_to_item
        WHERE di.offered_item_id = p_from_item
          AND di.category_id = to_oi.category_id
          AND to_oi.status = 'active'
          AND from_oi.status = 'active'
          AND to_oi.user_id <> from_oi.user_id
          AND (di.min_price IS NULL OR to_oi.estimated_price >= di.min_price)
          AND (di.max_price IS NULL OR to_oi.estimated_price <= di.max_price)
          AND (
                to_oi.city_name = from_oi.city_name
                OR (to_oi.delivery_enabled AND di.allow_delivery)
              )
          -- Сопоставление JSONB (если в desired_items заданы атрибуты, они проверяются на совпадение с offered_items)
          AND (
                di.attributes IS NULL 
                OR jsonb_array_length(di.attributes) = 0
                OR to_oi.attributes @> di.attributes
              )
    );
$$;

-- Основная функция поиска и создания цепочек
CREATE OR REPLACE FUNCTION find_and_create_exchange_chains(p_item_id UUID)
RETURNS SETOF UUID
LANGUAGE plpgsql
AS $$
DECLARE
    v_path           RECORD;
    v_chain_id       UUID;
    v_step_no        INT;
    v_from_item      UUID;
    v_to_item        UUID;
    v_from_user      UUID;
    v_to_user        UUID;
    v_already_exists BOOLEAN;
BEGIN
    -- Блокируем товар от параллельного поиска
    PERFORM pg_advisory_xact_lock(
        hashtextextended(p_item_id::text, 0)
    );

    FOR v_path IN
        WITH RECURSIVE chain_search AS (
            -- Анкер: стартуем с переданного товара
            SELECT
                oi.id                     AS start_item_id,
                oi.id                     AS current_item_id,
                ARRAY[oi.id]::UUID[]      AS item_path,
                ARRAY[oi.user_id]::UUID[] AS user_path,
                1                         AS depth
            FROM offered_items oi
            WHERE oi.id = p_item_id
              AND oi.status = 'active'

            UNION ALL

            -- Рекурсивный шаг
            SELECT
                cs.start_item_id,
                nxt.id,
                cs.item_path || nxt.id,
                cs.user_path || nxt.user_id,
                cs.depth + 1
            FROM chain_search cs
            JOIN offered_items nxt
                ON nxt.status = 'active'
               AND nxt.id       <> ALL (cs.item_path)   -- уникальный товар
               AND nxt.user_id  <> ALL (cs.user_path)  -- уникальный пользователь
               AND items_match(cs.current_item_id, nxt.id)
            WHERE cs.depth < 5
        )
        SELECT DISTINCT ON (item_path)
               start_item_id, item_path, user_path, depth
        FROM chain_search
        WHERE depth BETWEEN 2 AND 5
          AND items_match(current_item_id, start_item_id)   -- замыкающее ребро
        ORDER BY item_path, depth
    LOOP
        -- Защита от дублей цепочек
        SELECT EXISTS (
            SELECT 1
            FROM exchange_chains ec
            WHERE ec.status = 'proposed'
              AND ec.chain_length = v_path.depth
              AND (
                  SELECT array_agg(ecs.offered_item_id ORDER BY ecs.step_order)
                  FROM exchange_chain_steps ecs
                  WHERE ecs.chain_id = ec.id
              ) = v_path.item_path
        ) INTO v_already_exists;

        IF v_already_exists THEN
            CONTINUE;
        END IF;

        -- Создаём цепочку с явным указанием expires_at (24 часа)
        INSERT INTO exchange_chains (status, chain_length, expires_at)
        VALUES ('proposed', v_path.depth, NOW() + INTERVAL '24 hours')
        RETURNING id INTO v_chain_id;

        -- Заполняем шаги
        FOR v_step_no IN 1..v_path.depth LOOP
            v_from_item := v_path.item_path[v_step_no];
            v_from_user := v_path.user_path[v_step_no];

            IF v_step_no < v_path.depth THEN
                v_to_item := v_path.item_path[v_step_no + 1];
                v_to_user := v_path.user_path[v_step_no + 1];
            ELSE
                v_to_item := v_path.item_path[1];
                v_to_user := v_path.user_path[1];
            END IF;

            INSERT INTO exchange_chain_steps (
                chain_id, step_order,
                from_user_id, to_user_id,
                offered_item_id, received_item_id,
                is_accepted
            ) VALUES (
                v_chain_id, v_step_no,
                v_from_user, v_to_user,
                v_from_item, v_to_item,
                NULL
            );
        END LOOP;

        RETURN NEXT v_chain_id;
    END LOOP;

    RETURN;
END;
$$;
CREATE INDEX IF NOT EXISTS idx_offered_items_status
ON offered_items(status);