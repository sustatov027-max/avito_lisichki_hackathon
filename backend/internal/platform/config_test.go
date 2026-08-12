package platform

import (
	"fmt"
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type loadTestCase struct {
	name        string
	envVars     map[string]string
	unsetVars   []string
	expected    *Config
	wantErr     bool
	errContains string
}

func getLoadTestCases() []loadTestCase {
	return []loadTestCase{
		{
			name:      "Error - Missing required DB_PASSWORD",
			unsetVars: []string{"DB_PASSWORD"},
			wantErr:   true,
		},
		{
			name: "Success - Load with defaults when only DB_PASSWORD is provided",
			envVars: map[string]string{
				"DB_PASSWORD": "secret_password",
			},
			unsetVars: []string{
				"SERVER_PORT", "BASE_URL", "DB_HOST", "DB_PORT", "DB_USER", "DB_NAME", "DB_SSLMODE",
				"MINIO_ENDPOINT", "MINIO_ACCESS_KEY", "MINIO_SECRET_KEY", "MINIO_BUCKET", "MINIO_USE_SSL", "MINIO_BASE_URL",
			},
			expected: &Config{
				ServerPort:     "8080",
				BaseURL:        "http://localhost:8080",
				DBHost:         "localhost",
				DBPort:         "5433",
				DBUser:         "postgres",
				DBPassword:     "secret_password",
				DBName:         "url_shortener",
				DBSSLMode:      "disable",
				MinioEndpoint:  "localhost:9000",
				MinioAccessKey: "minioadmin",
				MinioSecretKey: "minioadmin",
				MinioBucket:    "photos",
				MinioUseSSL:    false,
				MinioBaseURL:   "http://localhost:9000",
			},
			wantErr: false,
		},
		{
			name: "Success - Override default values via env vars",
			envVars: map[string]string{
				"SERVER_PORT": "9090",
				"BASE_URL":    "https://example.com",
				"DB_HOST":     "pg-host",
				"DB_PORT":     "5432",
				"DB_USER":     "myuser",
				"DB_PASSWORD": "custom_password",
				"DB_NAME":     "custom_db",
				"DB_SSLMODE":  "require",
			},
			unsetVars: []string{
				"MINIO_ENDPOINT", "MINIO_ACCESS_KEY", "MINIO_SECRET_KEY", "MINIO_BUCKET", "MINIO_USE_SSL", "MINIO_BASE_URL",
			},
			expected: &Config{
				ServerPort:     "9090",
				BaseURL:        "https://example.com",
				DBHost:         "pg-host",
				DBPort:         "5432",
				DBUser:         "myuser",
				DBPassword:     "custom_password",
				DBName:         "custom_db",
				DBSSLMode:      "require",
				MinioEndpoint:  "localhost:9000",
				MinioAccessKey: "minioadmin",
				MinioSecretKey: "minioadmin",
				MinioBucket:    "photos",
				MinioUseSSL:    false,
				MinioBaseURL:   "http://localhost:9000",
			},
			wantErr: false,
		},
	}
}

func TestLoad(t *testing.T) {
	for _, tc := range getLoadTestCases() {
		t.Run(tc.name, func(t *testing.T) {
			for _, k := range tc.unsetVars {
				if oldVal, exists := os.LookupEnv(k); exists {
					err := os.Unsetenv(k)
					require.NoError(t, err)

					key := k
					val := oldVal
					t.Cleanup(func() {
						_ = os.Setenv(key, val)
					})
				}
			}

			for k, v := range tc.envVars {
				t.Setenv(k, v)
			}

			cfg, err := Load()

			if tc.wantErr {
				assert.Error(t, err)
				if tc.errContains != "" {
					assert.Contains(t, err.Error(), tc.errContains)
				}
				assert.Nil(t, cfg)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tc.expected, cfg)
			}
		})
	}
}

func TestConfig_DSN(t *testing.T) {
	cfg := &Config{
		DBUser:     "postgres",
		DBPassword: "secret_password",
		DBHost:     "localhost",
		DBPort:     "5432",
		DBName:     "my_database",
		DBSSLMode:  "disable",
	}

	expectedDSN := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable", cfg.DBUser, cfg.DBPassword, cfg.DBHost, cfg.DBPort, cfg.DBName)
	assert.Equal(t, expectedDSN, cfg.DSN())
}

func TestMustGet(t *testing.T) {
	t.Run("Success - Lazily load config once", func(t *testing.T) {
		loadedConfig = nil
		t.Setenv("DB_PASSWORD", "must_get_pass")

		cfg1 := MustGet()
		assert.NotNil(t, cfg1)
		assert.Equal(t, "must_get_pass", cfg1.DBPassword)

		t.Setenv("DB_PASSWORD", "new_pass")
		cfg2 := MustGet()

		assert.Same(t, cfg1, cfg2)
		assert.Equal(t, "must_get_pass", cfg2.DBPassword)
	})

	t.Run("Panic - Missing required config", func(t *testing.T) {
		loadedConfig = nil

		if oldVal, exists := os.LookupEnv("DB_PASSWORD"); exists {
			err := os.Unsetenv("DB_PASSWORD")
			require.NoError(t, err)

			t.Cleanup(func() {
				_ = os.Setenv("DB_PASSWORD", oldVal)
			})
		}

		assert.Panics(t, func() {
			MustGet()
		})
	})
}
