CREATE TABLE IF NOT EXISTS idempotency_keys (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    key VARCHAR(255) NOT NULL,
    request_hash CHAR(64) NOT NULL,
    response_status SMALLINT,
    response_body JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '24 hours'),
    PRIMARY KEY (user_id, key),
    CONSTRAINT chk_idempotency_response_status CHECK (
        response_status IS NULL OR response_status BETWEEN 100 AND 599
    ),
    CONSTRAINT chk_idempotency_response_complete CHECK (
        (response_status IS NULL) = (response_body IS NULL)
    )
);

CREATE INDEX idx_idempotency_keys_expires_at ON idempotency_keys(expires_at);
