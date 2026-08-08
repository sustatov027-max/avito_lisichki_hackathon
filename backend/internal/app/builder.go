package app

import (
	"context"
	"fmt"
	"log"
	"log/slog"
	"net/http"
	"os"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
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

	pool, err := pgxpool.New(context.Background(), config.DSN())
	if err != nil {
		logger.Error("error create postgres pool", "err", err)
		return nil, err
	}

	if err := pool.Ping(context.Background()); err != nil {
		logger.Error("error connect postgres", "err", err)
		pool.Close()
		return nil, err
	}

	app := &App{
		logger: logger,
		db:     pool,
	}
	app.closeResources = func() error {
		pool.Close()
		return nil
	}

	handler := app.registerRoutes()

	server := &http.Server{
		Addr:              fmt.Sprintf(":%s", config.ServerPort),
		Handler:           handler,
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       10 * time.Second,
		WriteTimeout:      10 * time.Second,
		IdleTimeout:       60 * time.Second,
		MaxHeaderBytes:    1 << 20,
	}

	app.server = server

	return app, nil
}
