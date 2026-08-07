package dto

// CanonicalAttribute — канонический формат атрибута, который ожидает items_match
type CanonicalAttribute struct {
	AttributeID string      `json:"attribute_id"`
	Value       interface{} `json:"value"`
}

// Игнорирует атрибуты, которые не имеют значений (value, values, min/max).
func NormalizeAttributes(attrs []Attribute) []CanonicalAttribute {
	result := make([]CanonicalAttribute, 0, len(attrs))

	for _, attr := range attrs {
		value, ok := canonicalValue(attr)
		if !ok {
			continue
		}

		result = append(result, CanonicalAttribute{
			AttributeID: attr.AttributeID,
			Value:       value,
		})
	}

	return result
}

// canonicalValue возвращает каноническое значение атрибута для сравнения в items_match.
func canonicalValue(attr Attribute) (interface{}, bool) {
	switch {
	case attr.MinValue != nil || attr.MaxValue != nil:
		rng := map[string]int{}
		if attr.MinValue != nil {
			rng["min"] = *attr.MinValue
		}
		if attr.MaxValue != nil {
			rng["max"] = *attr.MaxValue
		}
		return rng, true

	case len(attr.Values) > 0:
		return attr.Values, true

	case attr.Value != nil:
		return *attr.Value, true

	default:
		return nil, false
	}
}
