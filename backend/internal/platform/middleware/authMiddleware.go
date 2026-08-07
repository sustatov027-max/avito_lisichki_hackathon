package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func DummyAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. Считываем header (например, X-User-ID)
		userIDStr := c.GetHeader("X-User-ID")
		if userIDStr == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "unauthorized: missing X-User-ID header",
			})
			return
		}

		// 2. Парсим строку в uuid.UUID
		userID, err := uuid.Parse(userIDStr)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "invalid X-User-ID format, must be UUID",
			})
			return
		}

		// 3. Сохраняем uuid.UUID в контекст (именно под ключом "user_id")
		c.Set("user_id", userID)

		c.Next()
	}
}
