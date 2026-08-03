CREATE TABLE IF NOT EXISTS item_attributes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    attribute_id UUID NOT NULL REFERENCES category_attributes(id) ON DELETE CASCADE,
    value TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Уникальность: у товара не может быть двух значений для одного атрибута
ALTER TABLE item_attributes ADD CONSTRAINT unique_item_attribute UNIQUE (item_id, attribute_id);

CREATE INDEX idx_item_attributes_item_id ON item_attributes(item_id);
CREATE INDEX idx_item_attributes_attribute_id ON item_attributes(attribute_id);
CREATE INDEX idx_item_attributes_value ON item_attributes(value);