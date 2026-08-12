package platform

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

var (
	MinioClient *minio.Client
	MinioBucket string
	MinioCfg    *Config
)

// InitMinIO initializes MinIO client and ensures bucket exists.
func InitMinIO(cfg *Config) error {
	MinioCfg = cfg
	minioClient, err := minio.New(cfg.MinioEndpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(cfg.MinioAccessKey, cfg.MinioSecretKey, ""),
		Secure: cfg.MinioUseSSL,
	})
	if err != nil {
		return fmt.Errorf("init minio client: %w", err)
	}
	MinioClient = minioClient
	MinioBucket = cfg.MinioBucket

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	exists, err := MinioClient.BucketExists(ctx, MinioBucket)
	if err != nil {
		return fmt.Errorf("check minio bucket (%s): %w", cfg.MinioEndpoint, err)
	}
	if !exists {
		if err := MinioClient.MakeBucket(ctx, MinioBucket, minio.MakeBucketOptions{}); err != nil {
			if !strings.Contains(err.Error(), "bucket already exists") {
				return fmt.Errorf("create minio bucket: %w", err)
			}
		}
	}

	return nil
}

// Upload uploads object to MinIO and returns accessible URL
func Upload(ctx context.Context, objectName string, reader io.Reader, size int64, contentType string) (string, error) {
	if MinioClient == nil {
		return "", fmt.Errorf("minio client not initialized")
	}

	_, err := MinioClient.PutObject(ctx, MinioBucket, objectName, reader, size, minio.PutObjectOptions{ContentType: contentType})
	if err != nil {
		return "", fmt.Errorf("put object: %w", err)
	}

	base := ""
	if MinioCfg != nil && MinioCfg.BaseURL != "" {
		base = strings.TrimRight(MinioCfg.BaseURL, "/")
	} else if MinioCfg != nil {
		base = strings.TrimRight(MinioCfg.MinioBaseURL, "/")
	}
	return fmt.Sprintf("%s/photos/%s", base, objectName), nil
}

// GetObject retrieves object, content-type and content-length
func GetObject(ctx context.Context, objectName string) (io.ReadCloser, string, int64, error) {
	if MinioClient == nil {
		return nil, "", 0, fmt.Errorf("minio client not initialized")
	}

	obj, err := MinioClient.GetObject(ctx, MinioBucket, objectName, minio.GetObjectOptions{})
	if err != nil {
		return nil, "", 0, fmt.Errorf("get object: %w", err)
	}

	info, err := obj.Stat()
	if err != nil {
		// Если не удалось получить Stat, возвращаем размер -1, чтобы не блокировать процесс
		return obj, "application/octet-stream", -1, nil
	}

	ct := info.ContentType
	if ct == "" {
		ct = "application/octet-stream"
	}

	return obj, ct, info.Size, nil
}

// PhotoHandler streams object to client. Expected route: /photos/*object
func PhotoHandler(c *gin.Context) {
	objectName := c.Param("object")
	if objectName == "" {
		c.Status(http.StatusBadRequest)
		return
	}

	objectName = strings.TrimPrefix(objectName, "/")

	reader, contentType, contentLength, err := GetObject(c.Request.Context(), objectName)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "object not found"})
		return
	}
	defer func() {
		_ = reader.Close()
	}()

	// Отдаём поток напрямую без повторных вызовов Stat()
	c.DataFromReader(http.StatusOK, contentLength, contentType, reader, nil)
}
