package handlers

import (
	"net/http"

	"craigstjean.com/stsummarizer/internal/services"
	"github.com/gin-gonic/gin"
)

type CharactersHandler struct {
	stService services.SillyTavernService
}

func NewCharactersHandler(stService services.SillyTavernService) *CharactersHandler {
	return &CharactersHandler{
		stService: stService,
	}
}

func (h *CharactersHandler) GetCharacters(c *gin.Context) {
	user := c.Query("user")

	characters, err := h.stService.GetCharacters(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, characters)
}

func (h *CharactersHandler) GetCharacterBackups(c *gin.Context) {
	character := c.Param("character")
	user := c.Query("user")

	backups, err := h.stService.GetCharacterBackups(user, character)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, backups)
}

func (h *CharactersHandler) GetCharacterBackup(c *gin.Context) {
	character := c.Param("character")
	backup := c.Param("backup")
	user := c.Query("user")

	messages, err := h.stService.GetCharacterBackup(user, character, backup)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	messageContent := renderMessages(messages)

	c.JSON(http.StatusOK, messageContent)
}

func (h *CharactersHandler) RestoreCharacterBackup(c *gin.Context) {
	character := c.Param("character")
	backup := c.Param("backup")
	user := c.Query("user")

	newFileName, err := h.stService.RestoreCharacterBackup(user, character, backup)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":     "Backup restored successfully",
		"newFileName": newFileName,
	})
}

func (h *CharactersHandler) GetUsers(c *gin.Context) {
	users, err := h.stService.GetUsers()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, users)
}
