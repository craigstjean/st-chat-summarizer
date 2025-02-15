package sillytavern

import (
	"fmt"
	"os"
	"strings"
)

func (s *SillyTavernService) GetUsers() ([]string, error) {
	// Read directory entries
	entries, err := os.ReadDir(s.dataPath)
	if err != nil {
		return nil, fmt.Errorf("failed to read SillyTavern data directory: %w", err)
	}

	// Filter for directories that don't start with underscore
	var users []string
	for _, entry := range entries {
		if entry.IsDir() && !strings.HasPrefix(entry.Name(), "_") {
			users = append(users, entry.Name())
		}
	}

	return users, nil
}
