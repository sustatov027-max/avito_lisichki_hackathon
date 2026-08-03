package app

import (
	"context"
	"log/slog"
	"net/http"
	"os"
	"time"

	"github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/platform/health"
)

func New(_ context.Context) (*App, error) {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	mux := http.NewServeMux()

	mux.HandleFunc("GET /health", health.HealthHandler)
	server := &http.Server{
		Addr:              "localhost:8080",
		Handler:           mux,
		ReadHeaderTimeout: 5 * time.Second,
	}

	app := &App{
		server: server,
		logger: logger,
	}
	return app, nil
}
