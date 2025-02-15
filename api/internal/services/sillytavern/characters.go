package sillytavern

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

func (s *SillyTavernService) GetCharacters(user string) ([]string, error) {
	if user == "" {
		user = s.defaultUser
	}

	if strings.Contains(user, "..") {
		return nil, fmt.Errorf("invalid user name")
	}

	path := filepath.Join(s.dataPath, user, s.chatsPath)

	if _, err := os.Stat(path); os.IsNotExist(err) {
		return nil, fmt.Errorf("SillyTavern chats directory does not exist: %w", err)
	}

	entries, err := os.ReadDir(path)
	if err != nil {
		return nil, fmt.Errorf("failed to read SillyTavern chats directory: %w", err)
	}

	var characters []string
	for _, entry := range entries {
		if entry.IsDir() {
			characters = append(characters, entry.Name())
		}
	}

	return characters, nil
}
