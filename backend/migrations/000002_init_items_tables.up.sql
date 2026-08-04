-- Таблица предлагаемых вещей (что пользователь отдаёт)
CREATE TABLE IF NOT EXISTS offered_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    city_name VARCHAR(100) NOT NULL,
    delivery_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category_id UUID NOT NULL,
    estimated_price NUMERIC(12, 2) NOT NULL CHECK (estimated_price >= 0),
    photos TEXT[] DEFAULT '{}',
    attributes JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'reserved', 'exchanged'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Таблица желаемых вещей (что пользователь хочет получить взамен)
CREATE TABLE IF NOT EXISTS desired_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    offered_item_id UUID NOT NULL REFERENCES offered_items(id) ON DELETE CASCADE,
    title_pattern VARCHAR(255),
    category_id UUID NOT NULL, -- 👈 Убрали REFERENCES categories(id)
    min_price NUMERIC(12, 2) CHECK (min_price IS NULL OR min_price >= 0),
    max_price NUMERIC(12, 2) CHECK (max_price IS NULL OR max_price >= 0),
    allow_delivery BOOLEAN NOT NULL DEFAULT TRUE,
    attributes JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_desired_item_price_range CHECK (
        (min_price IS NULL OR max_price IS NULL) OR (min_price <= max_price)
    )
);

-- Индексы для ускорения поиска и матчинга
CREATE INDEX idx_offered_items_user ON offered_items(user_id);
CREATE INDEX idx_offered_items_category ON offered_items(category_id);
CREATE INDEX idx_offered_items_price ON offered_items(estimated_price);
CREATE INDEX idx_offered_items_attributes ON offered_items USING GIN (attributes);

CREATE INDEX idx_desired_items_offered ON desired_items(offered_item_id);
CREATE INDEX idx_desired_items_category ON desired_items(category_id);
CREATE INDEX idx_desired_items_price ON desired_items(min_price, max_price);
CREATE INDEX idx_desired_items_attributes ON desired_items USING GIN (attributes);