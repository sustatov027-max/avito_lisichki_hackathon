CREATE TABLE IF NOT EXISTS idempotency_keys (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    key VARCHAR(255) NOT NULL,
    request_hash CHAR(64) NOT NULL,
    response_status SMALLINT,
    response_body JSONB,
    offered_item_id UUID NOT NULL REFERENCES offered_items(id) ON DELETE CASCADE,
    desired_item_id UUID NOT NULL REFERENCES desired_items(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '24 hours'),
    PRIMARY KEY (user_id, key)
);

CREATE INDEX idx_idempotency_keys_expires_at ON idempotency_keys(expires_at);