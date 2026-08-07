package platform_test

import (
	"fmt"
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/platform"
)

func setTestEnv(t *testing.T, envs map[string]string) func() {
	t.Helper()
	originalEnvs := make(map[string]string)

	for key, val := range envs {
		originalEnvs[key] = os.Getenv(key)
		_ = os.Setenv(key, val)
	}

	return func() {
		for key := range envs {
			if orig, exists := originalEnvs[key]; exists && orig != "" {
				_ = os.Setenv(key, orig)
			} else {
				_ = os.Unsetenv(key)
			}
		}
	}
}

func TestLoad_SuccessWithDefaults(t *testing.T) {
	cleanup := setTestEnv(t, map[string]string{
		"DB_PASSWORD": "secret_password",
	})
	defer cleanup()

	cfg, err := platform.Load()

	assert.NoError(t, err)
	assert.NotNil(t, cfg)
	assert.Equal(t, "8080", cfg.ServerPort)
	assert.Equal(t, "http://localhost:8080", cfg.BaseURL)
	assert.Equal(t, "localhost", cfg.DBHost)
	assert.Equal(t, "5433", cfg.DBPort)
	assert.Equal(t, "postgres", cfg.DBUser)
	assert.Equal(t, "secret_password", cfg.DBPassword)
	assert.Equal(t, "url_shortener", cfg.DBName)
	assert.Equal(t, "disable", cfg.DBSSLMode)
}

func TestLoad_CustomEnvValues(t *testing.T) {
	cleanup := setTestEnv(t, map[string]string{
		"SERVER_PORT": "9090",
		"BASE_URL":    "http://example.com",
		"DB_HOST":     "db.internal",
		"DB_PORT":     "5432",
		"DB_USER":     "admin",
		"DB_PASSWORD": "custom_password",
		"DB_NAME":     "custom_db",
		"DB_SSLMODE":  "require",
	})
	defer cleanup()

	cfg, err := platform.Load()

	assert.NoError(t, err)
	assert.Equal(t, "9090", cfg.ServerPort)
	assert.Equal(t, "http://example.com", cfg.BaseURL)
	assert.Equal(t, "db.internal", cfg.DBHost)
	assert.Equal(t, "5432", cfg.DBPort)
	assert.Equal(t, "admin", cfg.DBUser)
	assert.Equal(t, "custom_password", cfg.DBPassword)
	assert.Equal(t, "custom_db", cfg.DBName)
	assert.Equal(t, "require", cfg.DBSSLMode)
}

func TestLoad_MissingRequiredDBPassword(t *testing.T) {
	cleanup := setTestEnv(t, map[string]string{})
	_ = os.Unsetenv("DB_PASSWORD")
	defer cleanup()

	cfg, err := platform.Load()

	assert.Error(t, err)
	assert.Nil(t, cfg)
	assert.Contains(t, err.Error(), "required key DB_PASSWORD missing")
}

func TestConfig_DSN(t *testing.T) {
	user := "myuser"
	pass := "mypassword"
	host := "127.0.0.1"
	port := "5432"
	dbName := "mydb"
	sslMode := "disable"

	cfg := &platform.Config{
		DBUser:     user,
		DBPassword: pass,
		DBHost:     host,
		DBPort:     port,
		DBName:     dbName,
		DBSSLMode:  sslMode,
	}

	expectedDSN := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=%s", user, pass, host, port, dbName, sslMode)
	assert.Equal(t, expectedDSN, cfg.DSN())
}

func TestMustGet_SuccessAndPanic(t *testing.T) {
	t.Run("Успешная инициализация и синглтон MustGet", func(t *testing.T) {
		cleanup := setTestEnv(t, map[string]string{
			"DB_PASSWORD": "must_get_pass",
		})
		defer cleanup()

		cfg1 := platform.MustGet()
		assert.NotNil(t, cfg1)
		assert.Equal(t, "must_get_pass", cfg1.DBPassword)

		// Повторный вызов должен возвращать тот же объект (синглтон)
		cfg2 := platform.MustGet()
		assert.Same(t, cfg1, cfg2)
	})
}
