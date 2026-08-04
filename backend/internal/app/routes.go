package app

import (
	"github.com/gin-gonic/gin"
	"github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/platform/health"
	// "github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/exchange/transport"
)

func (a *App) registerRoutes() *gin.Engine {
	router := gin.New()

	router.Use(gin.Recovery())

	// exchangeHandler := transport.NewExchangeHandler(/* передайте ваш exchangeService */)

	// api := router.Group("/api/v1")
	// {
	// 	api.POST("/offers", exchangeHandler.PostExchangeHandler)
	// }

	router.GET("/health", health.HealthHandler)

	return router
}