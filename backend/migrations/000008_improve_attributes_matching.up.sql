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
          -- Сопоставление атрибутов
          AND (
                -- 1. Требований к атрибутам нет — подходит любой товар
                di.attributes IS NULL
                OR jsonb_array_length(di.attributes) = 0

                -- 2. Не должно остаться ни одного требования di, которому товар to_oi не соответствует
                OR NOT EXISTS (
                    SELECT 1
                    FROM jsonb_array_elements(di.attributes) AS di_attr
                    LEFT JOIN jsonb_array_elements(to_oi.attributes) AS to_attr
                           ON di_attr->>'attribute_id' = to_attr->>'attribute_id'
                    WHERE
                      -- У товара B вообще нет такого атрибута
                      to_attr IS NULL

                      -- Атрибут есть, но значения не совпадают
                      OR (
                          -- 3а. Простые не-числовые значения (строки, boolean) должны быть строго равны
                          (
                              jsonb_typeof(di_attr->'value') NOT IN ('object', 'array', 'number')
                              AND di_attr->'value' <> to_attr->'value'
                          )
                          OR
                          -- 3б. Число и/или диапазон — пересечение через numrange
                          (
                              jsonb_typeof(di_attr->'value') IN ('object', 'number')
                              AND jsonb_typeof(to_attr->'value') IN ('object', 'number')
                              AND NOT (
                                  CASE
                                      WHEN jsonb_typeof(to_attr->'value') = 'number'
                                          THEN numrange((to_attr->>'value')::NUMERIC, (to_attr->>'value')::NUMERIC, '[]')
                                      ELSE numrange(
                                          COALESCE(((to_attr->'value')->>'min')::NUMERIC, -2147483648),
                                          COALESCE(((to_attr->'value')->>'max')::NUMERIC, 2147483647),
                                          '[]'
                                      )
                                  END
                                  &&
                                  CASE
                                      WHEN jsonb_typeof(di_attr->'value') = 'number'
                                          THEN numrange((di_attr->>'value')::NUMERIC, (di_attr->>'value')::NUMERIC, '[]')
                                      ELSE numrange(
                                          COALESCE(((di_attr->'value')->>'min')::NUMERIC, -2147483648),
                                          COALESCE(((di_attr->'value')->>'max')::NUMERIC, 2147483647),
                                          '[]'
                                      )
                                  END
                              )
                          )
                          OR
                          -- 3в. di задаёт список допустимых вариантов — value товара B должен туда входить
                          (
                              jsonb_typeof(di_attr->'value') = 'array'
                              AND NOT (
                                  CASE
                                      WHEN jsonb_typeof(to_attr->'value') = 'array'
                                          THEN di_attr->'value' ?| ARRAY(SELECT jsonb_array_elements_text(to_attr->'value'))
                                      ELSE di_attr->'value' ? (to_attr->>'value')
                                  END
                              )
                          )
                      )
                )
              )
    );
$$;