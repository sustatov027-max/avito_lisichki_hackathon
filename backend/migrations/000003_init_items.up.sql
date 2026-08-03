CREATE TABLE IF NOT EXISTS items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    condition VARCHAR(20) NOT NULL CHECK (condition IN ('new', 'like_new', 'good', 'used', 'poor')),
    estimated_value NUMERIC(12, 2),
    location VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'reserved', 'closed'))
);

CREATE INDEX idx_items_owner_id ON items(owner_id);
CREATE INDEX idx_items_category_id ON items(category_id);
CREATE INDEX idx_items_status ON items(status);
CREATE INDEX idx_items_created_at ON items(created_at DESC);