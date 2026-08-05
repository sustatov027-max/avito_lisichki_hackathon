CREATE OR REPLACE FUNCTION find_and_create_exchange_chains(start_item UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    chain RECORD;
    new_chain UUID;
    i integer;
BEGIN

FOR chain IN

WITH RECURSIVE graph AS (

    -- старт 

    SELECT

        oi.id AS start_item,

        oi.id AS current_item,

        oi.user_id,

        ARRAY[oi.id]::uuid[] AS items,

        ARRAY[oi.user_id]::uuid[] AS users,

        1 AS depth

    FROM offered_items oi

    WHERE oi.id = start_item

UNION ALL

    -- расширяем путь

    SELECT

        g.start_item,

        oi2.id,

        oi2.user_id,

        g.items || oi2.id,

        g.users || oi2.user_id,

        g.depth + 1

    FROM graph g

    JOIN desired_items d
      ON d.offered_item_id = g.current_item

    JOIN offered_items oi2
      ON oi2.category_id = d.category_id

     AND oi2.id <> ALL(g.items)

     AND oi2.user_id <> ALL(g.users)

     AND (
            d.min_price IS NULL
            OR oi2.estimated_price >= d.min_price
         )

     AND (
            d.max_price IS NULL
            OR oi2.estimated_price <= d.max_price
         )

    WHERE g.depth < 5

)

SELECT *

FROM graph g

JOIN desired_items d
  ON d.offered_item_id = g.current_item

JOIN offered_items finish
  ON finish.id = g.start_item
 AND finish.category_id = d.category_id

WHERE depth BETWEEN 2 AND 5

LOOP

    INSERT INTO exchange_chains(status, chain_length)

    VALUES ('proposed', chain.depth)

    RETURNING id INTO new_chain;

    FOR i IN 1..chain.depth LOOP

        INSERT INTO exchange_chain_steps(

            chain_id,

            step_order,

            from_user_id,

            to_user_id,

            offered_item_id,

            received_item_id

        )

        VALUES(

            new_chain,

            i,

            (
                SELECT user_id
                FROM offered_items
                WHERE id = chain.items[i]
            ),

            (
                SELECT user_id
                FROM offered_items
                WHERE id =
                CASE
                    WHEN i = chain.depth
                    THEN chain.items[1]
                    ELSE chain.items[i+1]
                END
            ),

            chain.items[i],

            CASE
                WHEN i = chain.depth
                THEN chain.items[1]
                ELSE chain.items[i+1]
            END

        );

    END LOOP;

END LOOP;

END;
$$;