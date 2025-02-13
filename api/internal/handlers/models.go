package handlers

import (
	"net/http"

	"craigstjean.com/stsummarizer/internal/services"
	"github.com/gin-gonic/gin"
)

type ModelsHandler struct {
	ollamaService *services.OllamaService
}

func NewModelsHandler(ollamaService *services.OllamaService) *ModelsHandler {
	return &ModelsHandler{
		ollamaService: ollamaService,
	}
}

func (h *ModelsHandler) GetModels(c *gin.Context) {
	models, err := h.ollamaService.GetModels()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models)
}
