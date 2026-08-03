CREATE TABLE IF NOT EXISTS item_interests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    to_item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    
    -- Пользователь не может выразить интерес к одному и тому же товару дважды
    CONSTRAINT unique_from_to_item UNIQUE (from_item_id, to_item_id),
    
    -- Нельзя выразить интерес к своему же товару
    CONSTRAINT different_items CHECK (from_item_id != to_item_id)
);

CREATE INDEX idx_item_interests_from_item_id ON item_interests(from_item_id);
CREATE INDEX idx_item_interests_to_item_id ON item_interests(to_item_id);
CREATE INDEX idx_item_interests_status ON item_interests(status);
CREATE INDEX idx_item_interests_created_at ON item_interests(created_at DESC);
CREATE INDEX idx_item_interests_from_status ON item_interests(from_item_id, status);
CREATE INDEX idx_item_interests_to_status ON item_interests(to_item_id, status);