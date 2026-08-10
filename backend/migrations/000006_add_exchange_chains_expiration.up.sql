ALTER TABLE exchange_chains
    ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE;

UPDATE exchange_chains
SET expires_at = created_at + INTERVAL '24 hours'
WHERE expires_at IS NULL;

ALTER TABLE exchange_chains
    ALTER COLUMN expires_at SET NOT NULL,
    ALTER COLUMN expires_at SET DEFAULT (CURRENT_TIMESTAMP + INTERVAL '24 hours');

CREATE INDEX idx_exchange_chains_expires_at ON exchange_chains(expires_at);
