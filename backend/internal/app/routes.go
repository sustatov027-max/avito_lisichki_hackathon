package app

import (
	"net/http"

	"github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/platform/health"
)

func (a *App) registerRoutes() http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("/health", health.HealthHandler)

	return mux
}