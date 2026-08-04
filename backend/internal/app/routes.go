package app

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	chainPostgres "github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/chains/repository/postgres"
	chainService "github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/chains/service"
	chainTransport "github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/chains/transport"
	"github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/exchange/repository/postgres"
	"github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/exchange/service"
	"github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/exchange/transport"
	"github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/platform/health"
)

func (a *App) registerRoutes() *gin.Engine {
	router := gin.New()

	router.Use(cors.Default())

	router.Use(gin.Recovery())

	exchangeRepository := postgres.NewTradeOfferRepository(a.db)
	exchangeService := service.NewExchangeService(exchangeRepository)
	exchangeHandler := transport.NewExchangeHandler(exchangeService)
	chainRepository := chainPostgres.NewChainRepository(a.db)
	chainsService := chainService.NewChainService(chainRepository)
	chainHandler := chainTransport.NewChainHandler(chainsService)

	api := router.Group("/api/v1")
	{
		api.POST("/offers", exchangeHandler.PostExchangeHandler)
		api.GET("/chains/:chain_id", chainHandler.GetChainHandler)
	}

	router.GET("/health", health.HealthHandler)

	return router
}
