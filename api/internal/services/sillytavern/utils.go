package sillytavern

import (
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
)

func (s *SillyTavernService) ValidateCharacterPath(user, character string) error {
	// Prevent directory traversal attempts
	if strings.Contains(user, "..") || strings.Contains(character, "..") {
		return fmt.Errorf("invalid character name")
	}

	// Validate that the character path exists and is a directory
	fullPath := filepath.Join(s.dataPath, user, s.chatsPath, character)

	fileInfo, err := os.Stat(fullPath)
	if os.IsNotExist(err) {
		return fmt.Errorf("character directory does not exist")
	}
	if err != nil {
		return fmt.Errorf("error accessing character directory: %w", err)
	}

	if !fileInfo.IsDir() {
		return fmt.Errorf("character path is not a directory")
	}

	return nil
}

func copyFile(src, dst string) error {
	sourceFile, err := os.Open(src)
	if err != nil {
		return err
	}
	defer sourceFile.Close()

	destFile, err := os.Create(dst)
	if err != nil {
		return err
	}
	defer destFile.Close()

	_, err = io.Copy(destFile, sourceFile)
	return err
}
