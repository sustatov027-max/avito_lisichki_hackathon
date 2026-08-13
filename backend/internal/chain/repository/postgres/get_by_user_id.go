package postgres

import (
	"context"
	"fmt"
	"strings"

	"github.com/google/uuid"
	chains "github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/chain"
	repoDTO "github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/chain/repository"
	"github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/platform"
)

func (r *ChainRepository) GetByUserID(
	ctx context.Context,
	userID uuid.UUID,
) ([]chains.Chain, error) {
	userChains, err := r.getChains(ctx, userID)
	if err != nil {
		return nil, err
	}

	for index := range userChains {
		steps, err := r.getSteps(ctx, userChains[index].ID)
		if err != nil {
			return nil, err
		}
		userChains[index].Steps = steps
	}

	return userChains, nil
}

func (r *ChainRepository) GetByUserAndID(
	ctx context.Context,
	chainID uuid.UUID,
	userID uuid.UUID,
) (*chains.Chain, error) {
	chain, err := r.getChain(ctx, chainID)
	if err != nil {
		return nil, err
	}

	steps, err := r.getSteps(ctx, chainID)
	if err != nil {
		return nil, err
	}
	if len(steps) == 0 {
		return nil, repoDTO.ErrStepNotFound
	}

	chain.Steps = steps
	return chain, nil
}

func (r *ChainRepository) getChain(
	ctx context.Context,
	chainID uuid.UUID,
) (*chains.Chain, error) {
	rows, err := r.db.Query(ctx, `
		SELECT c.id, c.status, c.chain_length, c.created_at, c.expires_at
		FROM exchange_chains c
		WHERE c.id = $1
	`, chainID)
	if err != nil {
		return nil, fmt.Errorf("query exchange chain: %w", err)
	}
	defer rows.Close()

	var chain chains.Chain
	found := false
	for rows.Next() {
		found = true
		if err := rows.Scan(
			&chain.ID,
			&chain.Status,
			&chain.ChainLength,
			&chain.CreatedAt,
			&chain.ExpiresAt,
		); err != nil {
			return nil, fmt.Errorf("scan exchange chain: %w", err)
		}
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate exchange chain: %w", err)
	}
	if !found {
		return nil, repoDTO.ErrChainNotFound
	}

	return &chain, nil
}

func (r *ChainRepository) getChains(
	ctx context.Context,
	userID uuid.UUID,
) ([]chains.Chain, error) {
	rows, err := r.db.Query(ctx, `
		SELECT c.id, c.status, c.chain_length, c.created_at, c.expires_at
		FROM exchange_chains c
		WHERE EXISTS (
			  SELECT 1
			  FROM exchange_chain_steps s
			  WHERE s.chain_id = c.id
				AND (s.from_user_id = $1 OR s.to_user_id = $1)
		  )
		ORDER BY c.created_at DESC
	`, userID)
	if err != nil {
		return nil, fmt.Errorf("query user exchange chains: %w", err)
	}
	defer rows.Close()

	userChains := make([]chains.Chain, 0)
	for rows.Next() {
		var chain chains.Chain
		if err := rows.Scan(
			&chain.ID,
			&chain.Status,
			&chain.ChainLength,
			&chain.CreatedAt,
			&chain.ExpiresAt,
		); err != nil {
			return nil, fmt.Errorf("scan user exchange chain: %w", err)
		}
		userChains = append(userChains, chain)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate user exchange chains: %w", err)
	}

	return userChains, nil
}

func (r *ChainRepository) getSteps(ctx context.Context, chainID uuid.UUID) ([]chains.Step, error) {
	rows, err := r.db.Query(ctx, `
		SELECT s.step_order,
		       from_user.id, from_user.name, COALESCE(offered.city_name, ''),
		       to_user.id, to_user.name, COALESCE(received.city_name, ''),
		       offered.id, offered.title, COALESCE(offered.description, ''), offered.category_id,
		       COALESCE(offered.photos, '{}'), offered.attributes, offered.estimated_price,
		       s.is_accepted
		FROM exchange_chain_steps s
		JOIN users from_user ON from_user.id = s.from_user_id
		JOIN users to_user ON to_user.id = s.to_user_id
		JOIN offered_items offered ON offered.id = s.offered_item_id
		LEFT JOIN offered_items received ON received.id = s.received_item_id
		WHERE s.chain_id = $1
		ORDER BY s.step_order
	`, chainID)
	if err != nil {
		return nil, fmt.Errorf("query exchange chain steps: %w", err)
	}
	defer rows.Close()

	steps := make([]chains.Step, 0)
	for rows.Next() {
		var step chains.Step
		if err := rows.Scan(
			&step.Order,
			&step.FromUser.ID, &step.FromUser.Name, &step.FromUser.City,
			&step.ToUser.ID, &step.ToUser.Name, &step.ToUser.City,
			&step.Item.ID, &step.Item.Title, &step.Item.Description, &step.Item.CategoryID,
			&step.Item.Photos, &step.Item.Attributes, &step.Item.EstimatedPrice,
			&step.IsAccepted,
		); err != nil {
			return nil, fmt.Errorf("scan exchange chain step: %w", err)
		}
		step.Item.Photos = normalizePhotos(step.Item.Photos)
		steps = append(steps, step)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate exchange chain steps: %w", err)
	}

	return steps, nil
}

func normalizePhoto(photo string) string {
	photo = strings.TrimSpace(photo)
	if photo == "" {
		return ""
	}
	if strings.HasPrefix(photo, "http://") || strings.HasPrefix(photo, "https://") {
		return photo
	}

	parts := strings.Split(photo, "/")
	objectName := parts[len(parts)-1]
	base := strings.TrimRight(platform.MustGet().BaseURL, "/")

	return base + "/photos/" + objectName
}

func normalizePhotos(photos []string) []string {
	if photos == nil {
		return []string{}
	}

	for index := range photos {
		photos[index] = normalizePhoto(photos[index])
	}

	return photos
}
