package app

import (
	"context"
	"fmt"
	"log"
	"log/slog"
	"net/http"
	"os"
	"time"

	"github.com/joho/godotenv"
	"github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/platform"
)

func New(_ context.Context) (*App, error) {
	if err := godotenv.Load(); err != nil {
		log.Println("Файл .env не найден, чтений из переменной среды")
	}

	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	config, err := platform.Load()
	if err != nil {
		logger.Error("error parse config", "err", err)
		return nil, err
	}

	app := &App{
		logger: logger,
	}

	handler := app.registerRoutes()

	server := &http.Server{
		Addr:              fmt.Sprintf(":%s", config.ServerPort),
		Handler:           handler,
		ReadHeaderTimeout: 5 * time.Second,
	}

	app.server = server

	return app, nil
}
