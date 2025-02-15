package services

import "craigstjean.com/stsummarizer/internal/models"

type SillyTavernService interface {
	GetUsers() ([]string, error)
	GetCharacters(user string) ([]string, error)
	GetCharacterChats(user, character string) ([]string, error)
	GetCharacterChat(user, character, chat string) ([]models.ChatMessage, error)
	GetCharacterBackups(user, character string) ([]string, error)
	GetCharacterBackup(user, character, backup string) ([]models.ChatMessage, error)
	RestoreCharacterBackup(user, character, backup string) (string, error)
	GetGroupChats(user string) ([]models.GroupChat, error)
	GetGroupChat(user, chat string) ([]models.ChatMessage, error)
}
