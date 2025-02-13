package main

import (
	"log"

	"craigstjean.com/stsummarizer/internal/handlers"
	"craigstjean.com/stsummarizer/internal/middleware"
	"craigstjean.com/stsummarizer/internal/services"
	"github.com/gin-gonic/gin"
)

func main() {
	// Initialize router
	r := gin.Default()

	// Add middleware
	r.Use(middleware.CORS())
	r.Use(middleware.RequestLogger())

	// Initialize API routes
	initializeRoutes(r)

	// Start server
	if err := r.Run(":8080"); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}

func initializeRoutes(r *gin.Engine) {
	// Initialize services
	ollamaService := services.NewOllamaService()
	stService := services.NewSillyTavernService()

	// Initialize handlers
	modelsHandler := handlers.NewModelsHandler(ollamaService)
	charactersHandler := handlers.NewCharactersHandler(stService)
	chatsHandler := handlers.NewChatsHandler(stService, ollamaService)
	groupsHandler := handlers.NewGroupsHandler(stService, ollamaService)

	// API group
	api := r.Group("/api")
	{
		// Models routes
		api.GET("/models", modelsHandler.GetModels)

		// Characters routes
		api.GET("/characters", charactersHandler.GetCharacters)
		api.GET("/characters/:character/backups", charactersHandler.GetCharacterBackups)
		api.GET("/characters/:character/backups/:backup", charactersHandler.GetCharacterBackup)
		api.POST("/characters/:character/backups/:backup/restore", charactersHandler.RestoreCharacterBackup)

		// Individual chats routes
		api.GET("/chats/:character", chatsHandler.GetCharacterChats)
		api.GET("/chats/:character/:chat", chatsHandler.GetChat)
		api.GET("/chats/:character/:chat/summary", chatsHandler.GetChatSummary)

		// Group chats routes
		api.GET("/groupChats", groupsHandler.GetGroupChats)
		api.GET("/groupChats/:chat", groupsHandler.GetGroupChat)
		api.GET("/groupChats/:chat/summary", groupsHandler.GetGroupChatSummary)
	}
}
