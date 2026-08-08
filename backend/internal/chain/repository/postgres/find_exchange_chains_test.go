package postgres

import (
	"context"
	"os"
	"testing"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/stretchr/testify/require"
)

func connectTestDB(t *testing.T) *pgxpool.Pool {
	dsn := os.Getenv("TEST_DATABASE_URL")
	if dsn == "" {
		t.Skip("TEST_DATABASE_URL is not set")
	}

	pool, err := pgxpool.New(context.Background(), dsn)
	require.NoError(t, err)
	require.NoError(t, pool.Ping(context.Background()))

	t.Cleanup(func() {
		pool.Close()
	})

	return pool
}

func TestFindAndCreateExchangeChains(t *testing.T) {
	pool := connectTestDB(t)
	ctx := context.Background()
	tx, err := pool.Begin(ctx)
	require.NoError(t, err)
	defer func() {
		_ = tx.Rollback(ctx)
	}()

	userA := uuid.New()
	userB := uuid.New()
	userC := uuid.New()
	category := uuid.New()
	insertUser(t, ctx, tx, userA, "alice@example.com")
	insertUser(t, ctx, tx, userB, "bob@example.com")
	insertUser(t, ctx, tx, userC, "carol@example.com")

	itemA := uuid.New()
	itemB := uuid.New()
	itemC := uuid.New()
	insertOfferedItem(t, ctx, tx, itemA, userA, category, "Москва", 100, true)
	insertOfferedItem(t, ctx, tx, itemB, userB, category, "Москва", 200, true)
	insertOfferedItem(t, ctx, tx, itemC, userC, category, "Москва", 300, true)

	insertDesiredItem(t, ctx, tx, itemA, category, 150, 350, true)
	insertDesiredItem(t, ctx, tx, itemB, category, 250, 450, true)
	insertDesiredItem(t, ctx, tx, itemC, category, 50, 250, true)

	chainID := createChainForItem(t, ctx, tx, itemA)
	require.NotEqual(t, uuid.Nil, chainID)

	var chainCount int
	err = tx.QueryRow(ctx, `SELECT COUNT(*) FROM exchange_chains WHERE id = $1 AND status = 'proposed'`, chainID).Scan(&chainCount)
	require.NoError(t, err)
	require.Equal(t, 1, chainCount)

	var stepCount int
	err = tx.QueryRow(ctx, `SELECT COUNT(*) FROM exchange_chain_steps WHERE chain_id = $1`, chainID).Scan(&stepCount)
	require.NoError(t, err)
	require.Equal(t, 3, stepCount)

	secondChainIDs := queryChainIDs(t, ctx, tx, itemA)
	require.Empty(t, secondChainIDs)
}

func insertUser(t *testing.T, ctx context.Context, tx pgx.Tx, id uuid.UUID, email string) {
	_, err := tx.Exec(ctx, `INSERT INTO users (id, name, email) VALUES ($1, $2, $3)`, id, email, email)
	require.NoError(t, err)
}

func insertOfferedItem(t *testing.T, ctx context.Context, tx pgx.Tx, id, userID, categoryID uuid.UUID, cityName string, price float64, deliveryEnabled bool) {
	_, err := tx.Exec(ctx, `
		INSERT INTO offered_items (id, user_id, city_name, delivery_enabled, title, description, category_id, estimated_price, photos, attributes, status)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, '{}', '[]'::jsonb, 'active')
	`, id, userID, cityName, deliveryEnabled, "item", "", categoryID, price)
	require.NoError(t, err)
}

func insertDesiredItem(t *testing.T, ctx context.Context, tx pgx.Tx, offeredItemID, categoryID uuid.UUID, minPrice, maxPrice float64, allowDelivery bool) {
	_, err := tx.Exec(ctx, `
		INSERT INTO desired_items (offered_item_id, title_pattern, category_id, min_price, max_price, allow_delivery, attributes)
		VALUES ($1, $2, $3, $4, $5, $6, '[]'::jsonb)
	`, offeredItemID, "item", categoryID, minPrice, maxPrice, allowDelivery)
	require.NoError(t, err)
}

func createChainForItem(t *testing.T, ctx context.Context, tx pgx.Tx, itemID uuid.UUID) uuid.UUID {
	rows, err := tx.Query(ctx, `SELECT find_and_create_exchange_chains($1)`, itemID)
	require.NoError(t, err)
	defer rows.Close()

	var chainID uuid.UUID
	if rows.Next() {
		require.NoError(t, rows.Scan(&chainID))
	}
	require.NoError(t, rows.Err())
	return chainID
}

func queryChainIDs(t *testing.T, ctx context.Context, tx pgx.Tx, itemID uuid.UUID) []uuid.UUID {
	rows, err := tx.Query(ctx, `SELECT find_and_create_exchange_chains($1)`, itemID)
	require.NoError(t, err)
	defer rows.Close()

	var chainIDs []uuid.UUID
	for rows.Next() {
		var id uuid.UUID
		require.NoError(t, rows.Scan(&id))
		chainIDs = append(chainIDs, id)
	}
	require.NoError(t, rows.Err())
	return chainIDs
}
