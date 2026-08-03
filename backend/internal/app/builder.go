package app

import (
	"avito_lisichki_hackathon/backend/internal/platform/health"
	"context"
	"log/slog"
	"net/http"
	"os"
)

func New(_ context.Context) (*App, error) {

	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	mux := http.NewServeMux()

	mux.HandleFunc("GET /health", health.HealthHandler)
	server := &http.Server{
		Addr:    "localhost:8080",
		Handler: mux,
	}

	app := &App{
		server: server,
		logger: logger,
	}
	return app, nil
}
