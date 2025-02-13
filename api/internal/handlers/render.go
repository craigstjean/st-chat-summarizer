package handlers

import (
	"fmt"
	"strings"

	"craigstjean.com/stsummarizer/internal/models"
)

func renderMessages(messages []models.ChatMessage) string {
	var sb strings.Builder

	for _, message := range messages {
		userSuffix := ""
		if message.IsUser {
			userSuffix = " (User)"
		}

		if message.Name != "" && message.Message != "" {
			sb.WriteString(fmt.Sprintf("**%s**%s: %s\n\n---\n\n", message.Name, userSuffix, message.Message))
		}
	}

	return sb.String()
}
