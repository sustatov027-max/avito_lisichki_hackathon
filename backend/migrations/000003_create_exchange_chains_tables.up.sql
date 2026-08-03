-- Таблица цепочек обмена (до 5 человек)
CREATE TABLE IF NOT EXISTS exchange_chains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status VARCHAR(50) NOT NULL DEFAULT 'proposed',
    chain_length INT NOT NULL CHECK (chain_length >= 2 AND chain_length <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Таблица участников и звеньев в цепочке
CREATE TABLE IF NOT EXISTS exchange_chain_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chain_id UUID NOT NULL REFERENCES exchange_chains(id) ON DELETE CASCADE,
    step_order INT NOT NULL CHECK (step_order >= 1 AND step_order <= 5),
    from_user_id UUID NOT NULL REFERENCES users(id),
    to_user_id UUID NOT NULL REFERENCES users(id),
    offered_item_id UUID NOT NULL REFERENCES offered_items(id),
    is_accepted BOOLEAN DEFAULT FALSE,
    UNIQUE(chain_id, step_order)
);

CREATE INDEX idx_exchange_chain_steps_chain ON exchange_chain_steps(chain_id);
CREATE INDEX idx_exchange_chain_steps_from_user ON exchange_chain_steps(from_user_id);
CREATE INDEX idx_exchange_chain_steps_to_user ON exchange_chain_steps(to_user_id);