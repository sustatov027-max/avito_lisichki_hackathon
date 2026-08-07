package app

import (
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	chainRepo "github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/chain/repository/postgres"
	chainService "github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/chain/service"
	chainTransport "github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/chain/transport"
	exchangeRepo "github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/exchange/repository/postgres"
	exchangeService "github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/exchange/service"
	exchangeTransport "github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/exchange/transport"
	"github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/platform/health"
	"github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/platform/middleware"
)

func (a *App) registerRoutes() *gin.Engine {
	router := gin.Default()

	router.Use(cors.New(cors.Config{
		AllowAllOrigins: true,

		AllowMethods: []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"},

		AllowHeaders: []string{
			"Origin",
			"Content-Type",
			"Accept",
			"Authorization",
			"Idempotency-Key",
			"X-User-ID",
			"X-Requested-With",
		},

		ExposeHeaders: []string{"Content-Length", "Content-Type"},

		MaxAge: 12 * time.Hour,
	}))

	// Exchange layer initialization
	exchangeRepository := exchangeRepo.NewTradeOfferRepository(a.db)
	exchangeSvc := exchangeService.NewExchangeService(exchangeRepository)
	exchangeHandler := exchangeTransport.NewExchangeHandler(exchangeSvc)

	// Chain layer initialization
	chainRepository := chainRepo.NewChainRepository(a.db)
	chainSvc := chainService.NewChainService(chainRepository)
	chainHandler := chainTransport.NewChainHandler(chainSvc)

	api := router.Group("/api/v1")
	{
		api.Use(middleware.DummyAuthMiddleware())
		{
			api.GET("/chains", chainHandler.GetChainsHandler)
			api.GET("/offers/my", exchangeHandler.GetMyOffersHandler)
			api.POST("/offers", exchangeHandler.PostExchangeHandler)
			api.POST("/chains/:chain_id/decision", chainHandler.ProcessDecisionHandler)
		}
	}

	router.GET("/health", health.HealthHandler)
	router.OPTIONS("/*path", func(c *gin.Context) {
		c.Status(204)
	})

	return router
}
