package app

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
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

	api := router.Group("/api/v1")
	{
		api.POST("/offers", exchangeHandler.PostExchangeHandler)
	}

	router.GET("/health", health.HealthHandler)

	return router
}
