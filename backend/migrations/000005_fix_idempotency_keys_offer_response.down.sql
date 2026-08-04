ALTER TABLE idempotency_keys
    ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN IF NOT EXISTS response_status SMALLINT,
    ADD COLUMN IF NOT EXISTS response_body JSONB,
    DROP COLUMN IF EXISTS offered_item_id,
    DROP COLUMN IF EXISTS desired_item_id,
    DROP COLUMN IF EXISTS status;

ALTER TABLE idempotency_keys
    ADD CONSTRAINT chk_idempotency_response_status CHECK (
        response_status IS NULL OR response_status BETWEEN 100 AND 599
    ),
    ADD CONSTRAINT chk_idempotency_response_complete CHECK (
        (response_status IS NULL) = (response_body IS NULL)
    );