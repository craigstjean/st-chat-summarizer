package handlers

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"craigstjean.com/stsummarizer/internal/services"
	"github.com/gin-gonic/gin"
)

type ChatsHandler struct {
	stService     *services.SillyTavernService
	ollamaService *services.OllamaService
}

func NewChatsHandler(stService *services.SillyTavernService, ollamaService *services.OllamaService) *ChatsHandler {
	return &ChatsHandler{
		stService:     stService,
		ollamaService: ollamaService,
	}
}

func (h *ChatsHandler) GetCharacterChats(c *gin.Context) {
	user := c.Query("user")
	character := c.Param("character")

	chats, err := h.stService.GetCharacterChats(user, character)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, chats)
}

func (h *ChatsHandler) GetChat(c *gin.Context) {
	user := c.Query("user")
	character := c.Param("character")
	chat := c.Param("chat")

	messages, err := h.stService.GetCharacterChat(user, character, chat)
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

func (h *ChatsHandler) GetChatSummary(c *gin.Context) {
	user := c.Query("user")
	model := c.Query("model")

	maxTokensStr := c.DefaultQuery("max_tokens", "3500")
	maxTokens, err := strconv.Atoi(maxTokensStr)
	if err != nil {
		maxTokens = 3500
	}

	summaryWordsStr := c.DefaultQuery("summary_words", "400")
	summaryWords, err := strconv.Atoi(summaryWordsStr)
	if err != nil {
		summaryWords = 400
	}

	character := c.Param("character")
	chat := c.Param("chat")

	// Get chat messages
	messages, err := h.stService.GetCharacterChat(user, character, chat)
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

	messageContent := renderMessagesForSummary(messages)

	// Get summary from Ollama
	summary, err := h.ollamaService.SummarizeChat(model, messageContent, maxTokens, summaryWords)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": fmt.Sprintf("failed to generate summary: %v", err),
		})
		return
	}

	c.JSON(http.StatusOK, summary)
}
