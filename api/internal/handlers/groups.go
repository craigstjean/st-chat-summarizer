package handlers

import (
	"fmt"
	"net/http"
	"strings"

	"craigstjean.com/stsummarizer/internal/services"
	"github.com/gin-gonic/gin"
)

type GroupsHandler struct {
	stService     *services.SillyTavernService
	ollamaService *services.OllamaService
}

func NewGroupsHandler(stService *services.SillyTavernService, ollamaService *services.OllamaService) *GroupsHandler {
	return &GroupsHandler{
		stService:     stService,
		ollamaService: ollamaService,
	}
}

func (h *GroupsHandler) GetGroupChats(c *gin.Context) {
	user := c.Query("user")

	groups, err := h.stService.GetGroupChats(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, groups)
}

func (h *GroupsHandler) GetGroupChat(c *gin.Context) {
	user := c.Query("user")
	chat := c.Param("chat")

	messages, err := h.stService.GetGroupChat(user, chat)
	if err != nil {
		status := http.StatusInternalServerError
		if strings.Contains(err.Error(), "does not exist") {
			status = http.StatusNotFound
		} else if strings.Contains(err.Error(), "invalid chat path") {
			status = http.StatusBadRequest
		}

		c.JSON(status, gin.H{
			"error": err.Error(),
		})
		return
	}

	messageContent := renderMessages(messages)

	c.JSON(http.StatusOK, messageContent)
}

func (h *GroupsHandler) GetGroupChatSummary(c *gin.Context) {
	user := c.Query("user")
	model := c.Query("model")
	chat := c.Param("chat")

	// Get chat messages
	messages, err := h.stService.GetGroupChat(user, chat)
	if err != nil {
		status := http.StatusInternalServerError
		if strings.Contains(err.Error(), "does not exist") {
			status = http.StatusNotFound
		} else if strings.Contains(err.Error(), "invalid chat path") {
			status = http.StatusBadRequest
		}

		c.JSON(status, gin.H{
			"error": err.Error(),
		})
		return
	}

	messageContent := renderMessages(messages)

	// Get summary from Ollama
	summary, err := h.ollamaService.SummarizeChat(model, messageContent)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": fmt.Sprintf("failed to generate summary: %v", err),
		})
		return
	}

	c.String(http.StatusOK, summary)
}
