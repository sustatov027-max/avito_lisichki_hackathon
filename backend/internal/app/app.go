package app

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
)

func Run() error {
	ctx, stop := signal.NotifyContext(
		context.Background(),
		os.Interrupt,
		syscall.SIGTERM,
	)
	defer stop()

	application, err := New(ctx)
	if err != nil {
		return fmt.Errorf("build application: %w", err)
	}

	return application.Run(ctx)
}

type App struct {
	logger         *slog.Logger
	server         *http.Server
	router         *gin.Engine
	closeResources func() error
}

func (a *App) Run(ctx context.Context) error {
	errCh := make(chan error, 1)

	go func() {
		a.logger.Info(
			"HTTP server started",
			"address", a.server.Addr,
		)

		if err := a.server.ListenAndServe(); err != nil &&
			!errors.Is(err, http.ErrServerClosed) {
			errCh <- err
		}
	}()

	select {
	case err := <-errCh:
		return fmt.Errorf("HTTP server: %w", err)

	case <-ctx.Done():
		a.logger.Info("shutdown signal received")
	}

	shutdownCtx, cancel := context.WithTimeout(
		context.Background(),
		5*time.Second,
	)
	defer cancel()

	if err := a.server.Shutdown(shutdownCtx); err != nil {
		return fmt.Errorf("shutdown HTTP server: %w", err)
	}

	if a.closeResources != nil {
		if err := a.closeResources(); err != nil {
			return fmt.Errorf("close resources: %w", err)
		}
	}

	a.logger.Info("application stopped")

	return nil
}
