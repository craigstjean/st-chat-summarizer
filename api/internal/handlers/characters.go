package handlers

import (
    "net/http"

    "github.com/gin-gonic/gin"
    "craigstjean.com/stsummarizer/internal/services"
)

type CharactersHandler struct {
    stService *services.SillyTavernService
}

func NewCharactersHandler(stService *services.SillyTavernService) *CharactersHandler {
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
