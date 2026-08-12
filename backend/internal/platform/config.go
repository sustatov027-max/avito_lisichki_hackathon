package platform

import (
	"fmt"

	"github.com/kelseyhightower/envconfig"
)

type Config struct {
	ServerPort string `envconfig:"SERVER_PORT" default:"8080"`
	BaseURL    string `envconfig:"BASE_URL" default:"http://localhost:8080"`

	// Параметры для подключения к Postgres
	DBHost     string `envconfig:"DB_HOST" default:"localhost"`
	DBPort     string `envconfig:"DB_PORT" default:"5433"`
	DBUser     string `envconfig:"DB_USER" default:"postgres"`
	DBPassword string `envconfig:"DB_PASSWORD" required:"true"`
	DBName     string `envconfig:"DB_NAME" default:"url_shortener"`
	DBSSLMode  string `envconfig:"DB_SSLMODE" default:"disable"`

	// MinIO configuration
	MinioEndpoint  string `envconfig:"MINIO_ENDPOINT" default:"localhost:9000"`
	MinioAccessKey string `envconfig:"MINIO_ACCESS_KEY" default:"minioadmin"`
	MinioSecretKey string `envconfig:"MINIO_SECRET_KEY" default:"minioadmin"`
	MinioBucket    string `envconfig:"MINIO_BUCKET" default:"photos"`
	MinioUseSSL    bool   `envconfig:"MINIO_USE_SSL" default:"false"`
	MinioBaseURL   string `envconfig:"MINIO_BASE_URL" default:"http://localhost:9000"`
}

var loadedConfig *Config

func Load() (*Config, error) {
	var config Config

	if err := envconfig.Process("", &config); err != nil {
		return nil, fmt.Errorf("ошибка загрузки конфига: %w", err)
	}

	return &config, nil
}

func (c *Config) DSN() string {
	return fmt.Sprintf(
		"postgres://%s:%s@%s:%s/%s?sslmode=%s",
		c.DBUser,
		c.DBPassword,
		c.DBHost,
		c.DBPort,
		c.DBName,
		c.DBSSLMode,
	)
}

func MustGet() *Config {
	if loadedConfig == nil {
		config, err := Load()
		if err != nil {
			panic(err)
		}
		loadedConfig = config
	}

	return loadedConfig
}
