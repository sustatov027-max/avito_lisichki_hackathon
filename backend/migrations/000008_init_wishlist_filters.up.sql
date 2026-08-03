CREATE TABLE IF NOT EXISTS wishlist_filters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wishlist_id UUID NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    min_value NUMERIC(12, 2),
    max_value NUMERIC(12, 2),
    attribute_id UUID REFERENCES category_attributes(id) ON DELETE CASCADE,
    operator VARCHAR(20) NOT NULL CHECK (operator IN ('eq', 'in', 'gte', 'lte', 'between')),
    value TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_wishlist_filters_wishlist_id ON wishlist_filters(wishlist_id);
CREATE INDEX idx_wishlist_filters_category_id ON wishlist_filters(category_id);
CREATE INDEX idx_wishlist_filters_attribute_id ON wishlist_filters(attribute_id);
CREATE INDEX idx_wishlist_filters_wishlist_category ON wishlist_filters(wishlist_id, category_id);