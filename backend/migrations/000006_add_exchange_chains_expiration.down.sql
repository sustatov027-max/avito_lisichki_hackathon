DROP INDEX IF EXISTS idx_exchange_chains_expires_at;

ALTER TABLE exchange_chains
    DROP COLUMN IF EXISTS expires_at;
