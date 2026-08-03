CREATE TABLE IF NOT EXISTS category_attributes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    code VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    value_type VARCHAR(20) NOT NULL CHECK (value_type IN ('string', 'number','boolean')),
    required BOOLEAN NOT NULL DEFAULT false,
    filterable BOOLEAN NOT NULL DEFAULT false,
    unit VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

ALTER TABLE category_attributes ADD CONSTRAINT unique_category_code UNIQUE (category_id, code);

CREATE INDEX idx_category_attributes_category_id ON category_attributes(category_id);
CREATE INDEX idx_category_attributes_code ON category_attributes(code);
CREATE INDEX idx_category_attributes_value_type ON category_attributes(value_type);
CREATE INDEX idx_category_attributes_filterable ON category_attributes(filterable) WHERE filterable = true;