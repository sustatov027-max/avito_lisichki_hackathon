package postgres

import (
	"context"
	"fmt"
	"testing"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/stretchr/testify/require"
	chaindto "github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/chain/dto"
	chainservice "github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/chain/service"
	exchangedto "github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/exchange/dto"
	exchangepostgres "github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/exchange/repository/postgres"
	exchangeservice "github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/exchange/service"
)

func TestExchangeFlowIntegration(t *testing.T) {
	pool := connectTestDB(t)
	ctx := context.Background()

	exchangeSvc := exchangeservice.NewExchangeService(exchangepostgres.NewTradeOfferRepository(pool))
	chainSvc := chainservice.NewChainService(NewChainRepository(pool))

	t.Run("all users accept reserves items and invalidates overlapping proposed chains", func(t *testing.T) {
		fixture := createExchangeFlowFixture(t, ctx, pool, exchangeSvc, 3)

		chainID := fetchChainWithItems(t, ctx, pool, fixture.itemIDs)
		assertProposedChainSteps(t, ctx, pool, chainID, fixture.userIDs, fixture.itemIDs)

		overlappingChainID := createChainForItemOnPool(t, ctx, pool, fixture.itemIDs[1])
		require.NotEqual(t, uuid.Nil, overlappingChainID)
		require.NotEqual(t, chainID, overlappingChainID)

		for index, userID := range fixture.userIDs {
			resp, err := chainSvc.ProcessDecision(ctx, chainID.String(), userID, chaindto.DecisionRequest{Action: "accept"})
			require.NoError(t, err)
			if index < len(fixture.userIDs)-1 {
				require.Equal(t, "proposed", resp.Status)
			} else {
				require.Equal(t, "accepted", resp.Status)
			}
		}

		assertChainStatus(t, ctx, pool, chainID, "accepted")
		assertChainStatus(t, ctx, pool, overlappingChainID, "invalidated")
		assertItemStatuses(t, ctx, pool, fixture.itemIDs, "reserved")
	})

	t.Run("any reject rejects chain and leaves items active", func(t *testing.T) {
		fixture := createExchangeFlowFixture(t, ctx, pool, exchangeSvc, 3)

		chainID := fetchChainWithItems(t, ctx, pool, fixture.itemIDs)
		assertProposedChainSteps(t, ctx, pool, chainID, fixture.userIDs, fixture.itemIDs)

		resp, err := chainSvc.ProcessDecision(ctx, chainID.String(), fixture.userIDs[0], chaindto.DecisionRequest{Action: "accept"})
		require.NoError(t, err)
		require.Equal(t, "proposed", resp.Status)

		resp, err = chainSvc.ProcessDecision(ctx, chainID.String(), fixture.userIDs[1], chaindto.DecisionRequest{Action: "reject"})
		require.NoError(t, err)
		require.Equal(t, "rejected", resp.Status)

		assertChainStatus(t, ctx, pool, chainID, "rejected")
		assertItemStatuses(t, ctx, pool, fixture.itemIDs, "active")
	})
}

type dbExecutor interface {
	Exec(ctx context.Context, sql string, arguments ...any) (pgconn.CommandTag, error)
	Query(ctx context.Context, sql string, args ...any) (pgx.Rows, error)
	QueryRow(ctx context.Context, sql string, args ...any) pgx.Row
}

type exchangeFlowFixture struct {
	userIDs []uuid.UUID
	itemIDs []uuid.UUID
}

func createExchangeFlowFixture(t *testing.T, ctx context.Context, db dbExecutor, exchangeSvc *exchangeservice.ExchangeService, userCount int) exchangeFlowFixture {
	t.Helper()

	categoryID := uuid.New()
	userIDs := make([]uuid.UUID, userCount)
	itemIDs := make([]uuid.UUID, userCount)

	for i := range userCount {
		userIDs[i] = uuid.New()
		insertUserWithExecutor(t, ctx, db, userIDs[i], fmt.Sprintf("flow-%s-%d@example.com", uuid.NewString(), i))
	}

	// Задаем строго фиксированные цены для точного 3-звенного цикла:
	// Товар 0: 100, Товар 1: 200, Товар 2: 300
	prices := []int{100, 200, 300}

	for i, userID := range userIDs {
		// Каждый участник i хочет получить товар от следующего участника (i+1)%userCount:
		// User 0 (отдает 100) -> хочет 200 (диапазон 180..220) -> подходит ТОЛЬКО Item 1
		// User 1 (отдает 200) -> хочет 300 (диапазон 280..320) -> подходит ТОЛЬКО Item 2
		// User 2 (отдает 300) -> хочет 100 (диапазон 80..120)  -> подходит ТОЛЬКО Item 0
		nextPrice := prices[(i+1)%userCount]
		minPrice := nextPrice - 20
		maxPrice := nextPrice + 20

		resp, err := exchangeSvc.PostExchange(ctx, userID, fmt.Sprintf("offer-%s", uuid.NewString()), exchangedto.PostExchangeRequest{
			CityName:        "Москва",
			DeliveryEnabled: true,
			OfferedItem: exchangedto.OfferedItem{
				Title:          fmt.Sprintf("Товар %d %s", i, uuid.NewString()),
				Description:    "integration test offer",
				CategoryID:     categoryID.String(),
				EstimatedPrice: prices[i],
			},
			WantedItem: exchangedto.WantedItem{
				TitleQuery: "Любой товар из категории",
				CategoryID: categoryID.String(),
				MinPrice:   &minPrice,
				MaxPrice:   &maxPrice,
			},
		})
		require.NoError(t, err)
		itemIDs[i] = uuid.MustParse(resp.ID)
	}

	// Явно форсируем генерацию цепочек после добавления ВСЕХ товаров,
	// если PostExchange не вызывает поиск автоматически
	_ = createChainForItemOnPool(t, ctx, db, itemIDs[0])

	t.Cleanup(func() {
		_, _ = db.Exec(ctx, `DELETE FROM exchange_chains WHERE id IN (
			SELECT DISTINCT chain_id FROM exchange_chain_steps WHERE offered_item_id = ANY($1)
		)`, itemIDs)
		_, _ = db.Exec(ctx, `DELETE FROM offered_items WHERE id = ANY($1)`, itemIDs)
		_, _ = db.Exec(ctx, `DELETE FROM users WHERE id = ANY($1)`, userIDs)
	})

	return exchangeFlowFixture{userIDs: userIDs, itemIDs: itemIDs}
}

func insertUserWithExecutor(t *testing.T, ctx context.Context, db dbExecutor, id uuid.UUID, email string) {
	t.Helper()

	_, err := db.Exec(ctx, `INSERT INTO users (id, name, email) VALUES ($1, $2, $3)`, id, email, email)
	require.NoError(t, err)
}

func createChainForItemOnPool(t *testing.T, ctx context.Context, db dbExecutor, itemID uuid.UUID) uuid.UUID {
	t.Helper()

	rows, err := db.Query(ctx, `SELECT find_and_create_exchange_chains($1)`, itemID)
	require.NoError(t, err)
	defer rows.Close()

	var chainID uuid.UUID
	if rows.Next() {
		require.NoError(t, rows.Scan(&chainID))
	}
	require.NoError(t, rows.Err())
	return chainID
}

func fetchChainWithItems(t *testing.T, ctx context.Context, db dbExecutor, itemIDs []uuid.UUID) uuid.UUID {
	t.Helper()

	var chainID uuid.UUID
	err := db.QueryRow(ctx, `
		SELECT ec.id
		FROM exchange_chains ec
		JOIN exchange_chain_steps ecs ON ecs.chain_id = ec.id
		WHERE ec.status = 'proposed'
		  AND ecs.offered_item_id = ANY($1)
		GROUP BY ec.id
		HAVING COUNT(DISTINCT ecs.offered_item_id) = $2
		ORDER BY MIN(ec.created_at)
		LIMIT 1
	`, itemIDs, len(itemIDs)).Scan(&chainID)
	require.NoError(t, err)
	return chainID
}

func assertProposedChainSteps(t *testing.T, ctx context.Context, db dbExecutor, chainID uuid.UUID, userIDs, itemIDs []uuid.UUID) {
	t.Helper()

	assertChainStatus(t, ctx, db, chainID, "proposed")
	for i := range itemIDs {
		var count int
		err := db.QueryRow(ctx, `
			SELECT COUNT(*)
			FROM exchange_chain_steps
			WHERE chain_id = $1
			  AND from_user_id = $2
			  AND to_user_id = $3
			  AND offered_item_id = $4
			  AND received_item_id = $5
		`, chainID, userIDs[i], userIDs[(i+1)%len(userIDs)], itemIDs[i], itemIDs[(i+1)%len(itemIDs)]).Scan(&count)
		require.NoError(t, err)
		require.Equal(t, 1, count)
	}
}

func assertChainStatus(t *testing.T, ctx context.Context, db dbExecutor, chainID uuid.UUID, want string) {
	t.Helper()

	var status string
	err := db.QueryRow(ctx, `SELECT status FROM exchange_chains WHERE id = $1`, chainID).Scan(&status)
	require.NoError(t, err)
	require.Equal(t, want, status)
}

func assertItemStatuses(t *testing.T, ctx context.Context, db dbExecutor, itemIDs []uuid.UUID, want string) {
	t.Helper()

	var count int
	err := db.QueryRow(ctx, `SELECT COUNT(*) FROM offered_items WHERE id = ANY($1) AND status = $2`, itemIDs, want).Scan(&count)
	require.NoError(t, err)
	require.Equal(t, len(itemIDs), count)
}
