package services

import (
	"bufio"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"time"

	"craigstjean.com/stsummarizer/internal/config"
	"craigstjean.com/stsummarizer/internal/models"
)

type SillyTavernService struct {
	dataPath       string
	chatsPath      string
	groupsPath     string
	groupChatsPath string
	backupsPath    string
	defaultUser    string
}

func NewSillyTavernService() *SillyTavernService {
	return &SillyTavernService{
		dataPath:       config.GetSTDataPath(),
		chatsPath:      config.STChatsPath,
		groupsPath:     config.STGroupsPath,
		groupChatsPath: config.STGroupChatsPath,
		backupsPath:    config.STBackupsPath,
		defaultUser:    config.STDefaultUser,
	}
}

func (s *SillyTavernService) GetCharacters(user string) ([]string, error) {
	if user == "" {
		user = s.defaultUser
	}

	// Prevent directory traversal attempts
	if strings.Contains(user, "..") {
		return nil, fmt.Errorf("invalid user name")
	}

	path := filepath.Join(s.dataPath, user, s.chatsPath)

	// Check if directory exists
	if _, err := os.Stat(path); os.IsNotExist(err) {
		return nil, fmt.Errorf("SillyTavern chats directory does not exist: %w", err)
	}

	// Read directory
	entries, err := os.ReadDir(path)
	if err != nil {
		return nil, fmt.Errorf("failed to read SillyTavern chats directory: %w", err)
	}

	// Filter for directories and collect names
	var characters []string
	for _, entry := range entries {
		if entry.IsDir() {
			characters = append(characters, entry.Name())
		}
	}

	return characters, nil
}

func (s *SillyTavernService) GetCharacterChats(user, character string) ([]string, error) {
	if user == "" {
		user = s.defaultUser
	}

	// First validate the character path
	if err := s.ValidateCharacterPath(user, character); err != nil {
		return nil, err
	}

	// Get the full path for the character's directory
	characterPath := filepath.Join(s.dataPath, user, s.chatsPath, character)

	// Read directory
	entries, err := os.ReadDir(characterPath)
	if err != nil {
		return nil, fmt.Errorf("failed to read character chat directory: %w", err)
	}

	// Filter for chat files and collect names
	var chats []string
	for _, entry := range entries {
		// Skip directories and non-jsonl files
		if entry.IsDir() || !strings.HasSuffix(entry.Name(), ".jsonl") {
			continue
		}
		// Remove the .jsonl extension
		chatName := strings.TrimSuffix(entry.Name(), ".jsonl")
		chats = append(chats, chatName)
	}

	return chats, nil
}

func (s *SillyTavernService) GetCharacterChat(user, character, chat string) ([]models.ChatMessage, error) {
	if user == "" {
		user = s.defaultUser
	}

	// Check for directory traversal attempts
	if strings.Contains(user, "..") || strings.Contains(character, "..") || strings.Contains(chat, "..") {
		return nil, fmt.Errorf("invalid chat path")
	}

	// Construct file path
	chatPath := filepath.Join(s.dataPath, user, s.chatsPath, character, chat+".jsonl")

	// Check if file exists
	if _, err := os.Stat(chatPath); os.IsNotExist(err) {
		return nil, fmt.Errorf("chat file does not exist: %s", chat)
	}

	// Open the file
	file, err := os.Open(chatPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open chat file: %w", err)
	}
	defer file.Close()

	var messages []models.ChatMessage
	scanner := bufio.NewScanner(file)
	lineNum := 0

	// Read the file line by line
	for scanner.Scan() {
		lineNum++
		line := scanner.Text()

		// Skip empty lines
		if strings.TrimSpace(line) == "" {
			continue
		}

		var message models.ChatMessage
		if err := json.Unmarshal([]byte(line), &message); err != nil {
			return nil, fmt.Errorf("error parsing JSON at line %d: %w", lineNum, err)
		}

		messages = append(messages, message)
	}

	if err := scanner.Err(); err != nil {
		return nil, fmt.Errorf("error reading file: %w", err)
	}

	return messages, nil
}

func (s *SillyTavernService) GetCharacterBackups(user, character string) ([]string, error) {
	if user == "" {
		user = s.defaultUser
	}

	// First validate the character path
	if err := s.ValidateCharacterPath(user, character); err != nil {
		return nil, err
	}

	// Create backup directory path
	backupsDir := filepath.Join(s.dataPath, user, s.backupsPath)

	// Replace non-alphanumeric characters with underscore and convert to lowercase
	safeCharName := regexp.MustCompile(`[^a-zA-Z0-9]`).ReplaceAllString(strings.ToLower(character), "_")

	// Create the pattern to match backup files
	pattern := fmt.Sprintf("chat_%s_*.jsonl", safeCharName)

	// List all matching files
	matches, err := filepath.Glob(filepath.Join(backupsDir, pattern))
	if err != nil {
		return nil, fmt.Errorf("failed to list backups: %w", err)
	}

	// Map to track unique content hashes
	seen := make(map[string]string) // hash -> filename
	for _, match := range matches {
		// Read the backup content
		messages, err := s.GetCharacterBackup(user, character, filepath.Base(match))
		if err != nil {
			continue // Skip files we can't read
		}

		// Create a content hash based on the messages
		var contentBuilder strings.Builder
		for _, msg := range messages {
			contentBuilder.WriteString(msg.Name)
			contentBuilder.WriteString(msg.Message)
		}
		contentHash := contentBuilder.String()

		// If we haven't seen this content before, or if this is a newer file with the same content
		if existingFile, exists := seen[contentHash]; !exists || filepath.Base(match) > existingFile {
			seen[contentHash] = filepath.Base(match)
		}
	}

	// Collect unique filenames
	uniqueBackups := make([]string, 0, len(seen))
	for _, filename := range seen {
		uniqueBackups = append(uniqueBackups, filename)
	}

	// Sort in reverse chronological order (newest first)
	sort.Slice(uniqueBackups, func(i, j int) bool {
		return uniqueBackups[i] > uniqueBackups[j]
	})

	return uniqueBackups, nil
}

func (s *SillyTavernService) GetCharacterBackup(user, character, backup string) ([]models.ChatMessage, error) {
	if user == "" {
		user = s.defaultUser
	}

	// First validate the character path
	if err := s.ValidateCharacterPath(user, character); err != nil {
		return nil, err
	}

	// Create backup directory path
	backupsDir := filepath.Join(s.dataPath, user, s.backupsPath)

	// Validate the backup filename
	if !strings.HasPrefix(backup, "chat_") || !strings.HasSuffix(backup, ".jsonl") {
		return nil, fmt.Errorf("invalid backup filename format")
	}

	// Convert character name to safe format for validation
	safeCharName := regexp.MustCompile(`[^a-zA-Z0-9]`).ReplaceAllString(strings.ToLower(character), "_")
	expectedPrefix := fmt.Sprintf("chat_%s_", safeCharName)
	if !strings.HasPrefix(backup, expectedPrefix) {
		return nil, fmt.Errorf("backup filename does not match character")
	}

	// Read the backup file
	backupPath := filepath.Join(backupsDir, backup)
	file, err := os.Open(backupPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open backup file: %w", err)
	}
	defer file.Close()

	// Read the file line by line, as each line is a JSON object
	var messages []models.ChatMessage
	scanner := bufio.NewScanner(file)
	lineNum := 0

	// Read the file line by line
	for scanner.Scan() {
		lineNum++
		line := scanner.Text()

		// Skip empty lines
		if strings.TrimSpace(line) == "" {
			continue
		}

		var message models.ChatMessage
		if err := json.Unmarshal([]byte(line), &message); err != nil {
			return nil, fmt.Errorf("error parsing JSON at line %d: %w", lineNum, err)
		}

		if message.Message != "" {
			messages = append(messages, message)
		}
	}

	if err := scanner.Err(); err != nil {
		return nil, fmt.Errorf("error reading file: %w", err)
	}

	return messages, nil
}

func (s *SillyTavernService) RestoreCharacterBackup(user, character, backup string) (string, error) {
	if user == "" {
		user = s.defaultUser
	}

	// First validate the character path
	if err := s.ValidateCharacterPath(user, character); err != nil {
		return "", err
	}

	// Paths
	backupsDir := filepath.Join(s.dataPath, user, s.backupsPath)
	chatsDir := filepath.Join(s.dataPath, user, s.chatsPath, character)

	// Validate inputs and format character folder name
	if !strings.HasPrefix(backup, "chat_") || !strings.HasSuffix(backup, ".jsonl") {
		return "", fmt.Errorf("invalid backup filename format")
	}

	safeCharName := regexp.MustCompile(`[^a-zA-Z0-9]`).ReplaceAllString(strings.ToLower(character), "_")
	expectedPrefix := fmt.Sprintf("chat_%s_", safeCharName)
	if !strings.HasPrefix(backup, expectedPrefix) {
		return "", fmt.Errorf("backup filename does not match character")
	}

	backupPath := filepath.Join(backupsDir, backup)

	// Check if the backup file exists
	if _, err := os.Stat(backupPath); os.IsNotExist(err) {
		return "", fmt.Errorf("backup file not found")
	}

	// Ensure chat directory exists
	if err := os.MkdirAll(chatsDir, os.ModePerm); err != nil {
		return "", fmt.Errorf("failed to create chat directory: %w", err)
	}

	// List existing files in the chat directory
	files, err := os.ReadDir(chatsDir)
	if err != nil {
		return "", fmt.Errorf("failed to read chat directory: %w", err)
	}

	var newFileName string

	// Determine the new filename based on existing files
	if len(files) == 0 { // No existing files
		// Format: "yyyy-M-d @HHh mm'm' ss's' 000ms.jsonl"
		newFileName = time.Now().Format("2006-1-2 @15h 04m 05s 000ms.jsonl")
	} else { // There are existing files
		highestBranch := 1
		branchRegex := regexp.MustCompile(`Branch #(\d+) - `)

		for _, file := range files {
			match := branchRegex.FindStringSubmatch(file.Name())
			if match != nil {
				branch, err := strconv.Atoi(match[1])
				if err == nil && branch > highestBranch {
					highestBranch = branch
				}
			}
		}

		// Start at Branch #2 if no branch files exist
		if highestBranch == 1 {
			highestBranch = 2
		}

		newFileName = fmt.Sprintf("Branch #%d - %s.jsonl", highestBranch, time.Now().Format("2006-01-02@15h04m05s"))
	}

	// Copy the backup file to the chat directory
	destPath := filepath.Join(chatsDir, newFileName)
	if err := copyFile(backupPath, destPath); err != nil {
		return "", fmt.Errorf("failed to restore backup: %w", err)
	}

	return newFileName, nil
}

// Helper function to copy a file
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

func (s *SillyTavernService) GetGroupChats(user string) ([]models.GroupChat, error) {
	if user == "" {
		user = s.defaultUser
	}

	// Prevent directory traversal attempts
	if strings.Contains(user, "..") {
		return nil, fmt.Errorf("invalid user name")
	}

	fullPath := filepath.Join(s.dataPath, user, s.groupsPath)

	// Check if directory exists
	if _, err := os.Stat(fullPath); os.IsNotExist(err) {
		return nil, fmt.Errorf("SillyTavern groups directory does not exist: %w", err)
	}

	// Read directory
	entries, err := os.ReadDir(fullPath)
	if err != nil {
		return nil, fmt.Errorf("failed to read SillyTavern groups directory: %w", err)
	}

	var groups []models.GroupChat

	// Read each JSON file
	for _, entry := range entries {
		if entry.IsDir() || !strings.HasSuffix(entry.Name(), ".json") {
			continue
		}

		// Read and parse the group file
		filePath := filepath.Join(fullPath, entry.Name())
		fileContent, err := os.ReadFile(filePath)
		if err != nil {
			return nil, fmt.Errorf("failed to read group file %s: %w", entry.Name(), err)
		}

		var group models.GroupChat
		if err := json.Unmarshal(fileContent, &group); err != nil {
			return nil, fmt.Errorf("failed to parse group file %s: %w", entry.Name(), err)
		}

		groups = append(groups, group)
	}

	return groups, nil
}

func (s *SillyTavernService) GetGroupChat(user, chat string) ([]models.ChatMessage, error) {
	if user == "" {
		user = s.defaultUser
	}

	// Check for directory traversal attempts
	if strings.Contains(user, "..") || strings.Contains(chat, "..") {
		return nil, fmt.Errorf("invalid chat path")
	}

	// Construct file path
	chatPath := filepath.Join(s.dataPath, user, s.groupChatsPath, chat+".jsonl")

	// Check if file exists
	if _, err := os.Stat(chatPath); os.IsNotExist(err) {
		return nil, fmt.Errorf("chat file does not exist: %s", chat)
	}

	// Open the file
	file, err := os.Open(chatPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open chat file: %w", err)
	}
	defer file.Close()

	var messages []models.ChatMessage
	scanner := bufio.NewScanner(file)
	lineNum := 0

	// Read the file line by line
	for scanner.Scan() {
		lineNum++
		line := scanner.Text()

		// Skip empty lines
		if strings.TrimSpace(line) == "" {
			continue
		}

		var message models.ChatMessage
		if err := json.Unmarshal([]byte(line), &message); err != nil {
			return nil, fmt.Errorf("error parsing JSON at line %d: %w", lineNum, err)
		}

		messages = append(messages, message)
	}

	if err := scanner.Err(); err != nil {
		return nil, fmt.Errorf("error reading file: %w", err)
	}

	return messages, nil
}

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
