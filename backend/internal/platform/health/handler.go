package health

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type HealthResponse struct {
	Status string `json:"status" example:"ok"`
}

// HealthHandler returns simple health status
// @Summary Health check
// @Description Returns service health status
// @Tags Health
// @Accept json
// @Produce json
// @Success 200 {object} HealthResponse "{\"status\":\"ok\"}"
// @Router /health [get]
func HealthHandler(c *gin.Context) {
	c.JSON(http.StatusOK, HealthResponse{
		Status: "ok",
	})
}
