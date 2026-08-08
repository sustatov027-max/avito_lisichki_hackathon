package platform

import (
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
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
			},
			expected: &Config{
				ServerPort: "8080",
				BaseURL:    "http://localhost:8080",
				DBHost:     "localhost",
				DBPort:     "5433",
				DBUser:     "postgres",
				DBPassword: "secret_password",
				DBName:     "url_shortener",
				DBSSLMode:  "disable",
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
			expected: &Config{
				ServerPort: "9090",
				BaseURL:    "https://example.com",
				DBHost:     "pg-host",
				DBPort:     "5432",
				DBUser:     "myuser",
				DBPassword: "custom_password",
				DBName:     "custom_db",
				DBSSLMode:  "require",
			},
			wantErr: false,
		},
	}
}

func TestLoad(t *testing.T) {
	for _, tc := range getLoadTestCases() {
		t.Run(tc.name, func(t *testing.T) {
			// Удаляем переменные, отсутствие которых нужно проверить
			for _, k := range tc.unsetVars {
				if oldVal, exists := os.LookupEnv(k); exists {
					os.Unsetenv(k)
					defer os.Setenv(k, oldVal)
				}
			}

			// Устанавливаем переданные переменные
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

	expectedDSN := "postgres://postgres:secret_password@localhost:5432/my_database?sslmode=disable"
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
			os.Unsetenv("DB_PASSWORD")
			defer os.Setenv("DB_PASSWORD", oldVal)
		}

		assert.Panics(t, func() {
			MustGet()
		})
	})
}