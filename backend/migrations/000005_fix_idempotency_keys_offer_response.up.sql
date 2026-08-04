ALTER TABLE idempotency_keys
    ADD COLUMN IF NOT EXISTS offered_item_id UUID REFERENCES offered_items(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS desired_item_id UUID REFERENCES desired_items(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS status VARCHAR(50);

ALTER TABLE idempotency_keys
    DROP CONSTRAINT IF EXISTS chk_idempotency_response_status,
    DROP CONSTRAINT IF EXISTS chk_idempotency_response_complete;

DELETE FROM idempotency_keys
WHERE offered_item_id IS NULL
   OR desired_item_id IS NULL
   OR status IS NULL;

ALTER TABLE idempotency_keys
    DROP COLUMN IF EXISTS response_status,
    DROP COLUMN IF EXISTS response_body;

ALTER TABLE idempotency_keys
    ALTER COLUMN offered_item_id SET NOT NULL,
    ALTER COLUMN desired_item_id SET NOT NULL,
    ALTER COLUMN status SET NOT NULL,
    ALTER COLUMN created_at DROP DEFAULT;