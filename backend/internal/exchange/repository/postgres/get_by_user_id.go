package postgres

import (
	"context"
	"fmt"
	"strings"

	"github.com/google/uuid"
	"github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/exchange"
	"github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/platform"
)

func (r *TradeOfferRepository) GetByUserID(ctx context.Context, userID uuid.UUID) ([]exchange.Item, error) {
	rows, err := r.db.Query(ctx, `
		SELECT oi.id, oi.title, oi.category_id, oi.estimated_price,
		       oi.city_name, oi.delivery_enabled, oi.photos, oi.status, oi.created_at,
		       di.id, di.title_pattern, di.category_id, di.min_price, di.max_price,
		       di.allow_delivery,
		       chain.id, chain.status, chain.chain_length, chain.user_action_required
		FROM offered_items oi
		JOIN desired_items di ON di.offered_item_id = oi.id
		LEFT JOIN LATERAL (
			SELECT ec.id, ec.status, ec.chain_length,
			       ec.status = 'proposed' AND ecs.is_accepted IS NULL AS user_action_required
			FROM exchange_chain_steps ecs
			JOIN exchange_chains ec ON ec.id = ecs.chain_id
			WHERE ecs.offered_item_id = oi.id
			  AND ecs.from_user_id = oi.user_id
			  AND ec.status IN ('proposed', 'accepted')
			ORDER BY CASE ec.status WHEN 'proposed' THEN 0 ELSE 1 END, ec.created_at DESC
			LIMIT 1
		) chain ON TRUE
		WHERE oi.user_id = $1
		ORDER BY oi.created_at DESC
	`, userID)
	if err != nil {
		return nil, fmt.Errorf("query user offers: %w", err)
	}
	defer rows.Close()

	items := make([]exchange.Item, 0)
	for rows.Next() {
		var item exchange.Item
		var chainID *uuid.UUID
		var chainStatus *string
		var chainLength *int
		var actionRequired *bool
		if err := rows.Scan(
			&item.ID, &item.Title, &item.CategoryID, &item.EstimatedPrice,
			&item.CityName, &item.DeliveryEnabled, &item.Photos, &item.Status, &item.CreatedAt,
			&item.DesiredItem.ID, &item.DesiredItem.TitlePattern, &item.DesiredItem.CategoryID,
			&item.DesiredItem.MinPrice, &item.DesiredItem.MaxPrice, &item.DesiredItem.AllowDelivery,
			&chainID, &chainStatus, &chainLength, &actionRequired,
		); err != nil {
			return nil, fmt.Errorf("scan user offer: %w", err)
		}
		if chainID != nil {
			item.Chain = &exchange.ChainInfo{
				ID: *chainID, Status: *chainStatus, Length: *chainLength,
				UserActionRequired: actionRequired != nil && *actionRequired,
			}
		}
		if item.Photos == nil {
			item.Photos = []string{}
		}
		// Normalize photo entries: if stored value is not an absolute URL, treat as object name and build proxy URL
		for i, p := range item.Photos {
			p = strings.TrimSpace(p)
			if p == "" {
				continue
			}
			if strings.HasPrefix(p, "http://") || strings.HasPrefix(p, "https://") {
				item.Photos[i] = p
				continue
			}
			// If p contains '/', take base name
			bn := p
			if strings.Contains(p, "/") {
				parts := strings.Split(p, "/")
				bn = parts[len(parts)-1]
			}
			base := platform.MustGet().BaseURL
			item.Photos[i] = strings.TrimRight(base, "/") + "/photos/" + bn
		}
		items = append(items, item)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate user offers: %w", err)
	}

	return items, nil
}
