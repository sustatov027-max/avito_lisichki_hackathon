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
          AND (
                di.attributes IS NULL
                OR jsonb_array_length(di.attributes) = 0
                OR to_oi.attributes @> di.attributes
              )
    );
$$;