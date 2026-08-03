CREATE TABLE IF NOT EXISTS attribute_values (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attribute_id UUID NOT NULL REFERENCES category_attributes(id) ON DELETE CASCADE,
    value VARCHAR(255) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

ALTER TABLE attribute_values ADD CONSTRAINT unique_attribute_value UNIQUE (attribute_id, value);

CREATE INDEX idx_attribute_values_attribute_id ON attribute_values(attribute_id);
CREATE INDEX idx_attribute_values_sort_order ON attribute_values(sort_order);