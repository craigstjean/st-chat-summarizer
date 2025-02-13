package config

import (
	"fmt"
	"os"
)

const (
	STChatsPath      = "chats"
	STGroupsPath     = "groups"
	STGroupChatsPath = "group chats"
	STBackupsPath    = "backups"
	STDefaultUser    = "default-user"
	DefaultModel     = "artifish/llama3.2-uncensored:latest"
)

func GetOllamaPort() string {
	port := os.Getenv("OLLAMA_PORT")
	if port == "" {
		port = "11434"
	}

	return port
}

func GetOllamaBaseURL() string {
	url := os.Getenv("OLLAMA_HOST")
	if url == "" {
		url = "localhost"
	}

	return fmt.Sprintf("http://%s:%s", url, GetOllamaPort())
}

func GetSTDataPath() string {
	path := os.Getenv("ST_DATA_PATH")
	if path == "" {
		panic("ST_DATA_PATH is not set")
	}

	return path
}
