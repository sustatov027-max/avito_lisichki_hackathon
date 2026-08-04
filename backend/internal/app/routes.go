package app

import (
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/exchange/repository/postgres"
	"github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/exchange/service"
	"github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/exchange/transport"
	"github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/platform/health"
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
			"X-Requested-With",
		},

		ExposeHeaders: []string{"Content-Length", "Content-Type"},

		MaxAge: 12 * time.Hour,
	}))

	exchangeRepository := postgres.NewTradeOfferRepository(a.db)
	exchangeService := service.NewExchangeService(exchangeRepository)
	exchangeHandler := transport.NewExchangeHandler(exchangeService)

	api := router.Group("/api/v1")
	{
		api.POST("/offers", exchangeHandler.PostExchangeHandler)
	}

	router.GET("/health", health.HealthHandler)
	router.OPTIONS("/*path", func(c *gin.Context) {
		c.Status(204)
	})

	return router
}
