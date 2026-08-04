package app

import (
	"github.com/gin-gonic/gin"
	"github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/exchange/repository/stub"
	"github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/exchange/service"
	"github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/exchange/transport"
	"github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/platform/health"
)

func (a *App) registerRoutes() *gin.Engine {
	router := gin.New()

	router.Use(gin.Recovery())

	exchangeRepository := stub.NewTradeOfferStubRepository()
	exchangeService := service.NewExchangeService(exchangeRepository)
	exchangeHandler := transport.NewExchangeHandler(exchangeService)

	api := router.Group("/api/v1")
	{
		api.POST("/offers", exchangeHandler.PostExchangeHandler)
	}

	router.GET("/health", health.HealthHandler)

	return router
}
