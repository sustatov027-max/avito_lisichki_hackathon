package transport

import (
	"encoding/json"
	"errors"
	"net/http"
	"path/filepath"
	"strconv"
	"strings"
	"unicode"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/exchange/dto"
	repoDTO "github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/exchange/repository"
	"github.com/sustatov027-max/avito_lisichki_hackathon/backend/internal/platform"
)

// PostExchangeHandler creates a new exchange offer
// @Summary Create exchange offer
// @Description Create a new offer (idempotent with Idempotency-Key header)
// @Tags Exchange
// @Accept json
// @Produce json
// @Param X-User-ID header string true "User ID (UUID). Example: 123e4567-e89b-12d3-a456-426614174000"
// @Param Idempotency-Key header string false "Idempotency key"
// @Param request body dto.PostExchangeRequest true "Post exchange request. Example: {\"city_name\":\"Moscow\",\"delivery_enabled\":false,\"offered_item\":{\"title\":\"Vintage Camera\",\"category_id\":\"electronics-vintage\"},\"wanted_item\":{\"title_query\":\"camera\"}}"
// @Success 201 {object} dto.PostExchangeResponse "Created"
// @Failure 400 {object} map[string]string "Bad request"
// @Failure 401 {object} map[string]string "Unauthorized"
// @Failure 404 {object} map[string]string "Not found"
// @Failure 409 {object} map[string]string "Conflict"
// @Failure 500 {object} map[string]string "Internal server error"
// @Router /api/v1/offers [post]
func (h *ExchangeHandler) PostExchangeHandler(c *gin.Context) {
	userIDValue, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized: missing user context"})
		return
	}

	userID, ok := userIDValue.(uuid.UUID)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "invalid user context type"})
		return
	}

	idempotencyKey := c.GetHeader(idempotencyKeyHeader)
	if !validIdempotencyKey(idempotencyKey) {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Idempotency-Key must contain 1 to 255 non-whitespace printable ASCII characters",
		})
		return
	}

	req, err := h.parsePostExchangeRequest(c)
	if err != nil {
		// Ошибка уже отправлена в JSON внутри хелпера
		return
	}

	resp, err := h.service.PostExchange(c.Request.Context(), userID, idempotencyKey, req)
	if err != nil {
		h.handlePostExchangeError(c, err)
		return
	}

	if resp.Replayed {
		c.Header("Idempotency-Replayed", "true")
	}

	c.JSON(http.StatusCreated, resp)
}

func (h *ExchangeHandler) parsePostExchangeRequest(c *gin.Context) (dto.PostExchangeRequest, error) {
	var req dto.PostExchangeRequest

	if !strings.HasPrefix(c.ContentType(), "multipart/form-data") {
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body: " + err.Error()})
			return req, err
		}
		return req, nil
	}

	payload := c.PostForm("payload")
	if strings.TrimSpace(payload) == "" {
		err := errors.New("multipart request must include 'payload' form field with JSON body")
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return req, err
	}

	if err := json.Unmarshal([]byte(payload), &req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid payload JSON: " + err.Error()})
		return req, err
	}

	if err := h.processUploadedPhotos(c, &req); err != nil {
		return req, err
	}

	return req, nil
}

func (h *ExchangeHandler) processUploadedPhotos(c *gin.Context, req *dto.PostExchangeRequest) error {
	form, err := c.MultipartForm()
	if err != nil || form == nil {
		return nil
	}

	for _, fh := range form.File["photos"] {
		f, err := fh.Open()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed read uploaded file"})
			return err
		}

		objectName := uuid.New().String() + filepath.Ext(fh.Filename)
		size := getFileSize(c, fh.Size)

		contentType := fh.Header.Get("Content-Type")
		if contentType == "" {
			contentType = "application/octet-stream"
		}

		url, err := platform.Upload(c.Request.Context(), objectName, f, size, contentType)
		_ = f.Close()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to upload file: " + err.Error()})
			return err
		}

		req.OfferedItem.Photos = append(req.OfferedItem.Photos, url)
	}

	return nil
}

func getFileSize(c *gin.Context, formSize int64) int64 {
	if formSize > 0 {
		return formSize
	}
	if s := c.Request.Header.Get("Content-Length"); s != "" {
		if v, _ := strconv.ParseInt(s, 10, 64); v > 0 {
			return v
		}
	}
	return 0
}

// handlePostExchangeError централизованно маппит ошибки сервиса в HTTP-ответы
func (h *ExchangeHandler) handlePostExchangeError(c *gin.Context, err error) {
	switch {
	case errors.Is(err, repoDTO.ErrInvalidRequest):
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
	case errors.Is(err, repoDTO.ErrUserNotFound):
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
	case errors.Is(err, repoDTO.ErrDuplicateOffer), errors.Is(err, repoDTO.ErrIdempotencyConflict):
		c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
	default:
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to create exchange offer: " + err.Error(),
		})
	}
}

func validIdempotencyKey(key string) bool {
	if key == "" {
		return true
	}
	if len(key) > 255 {
		return false
	}

	for _, char := range key {
		if char > unicode.MaxASCII || !unicode.IsPrint(char) || unicode.IsSpace(char) {
			return false
		}
	}

	return true
}
