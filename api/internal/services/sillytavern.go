package services

import (
    "bufio"
    "encoding/json"
    "fmt"
    "os"
    "path/filepath"
    "strings"

    "craigstjean.com/stsummarizer/internal/config"
    "craigstjean.com/stsummarizer/internal/models"
)

type SillyTavernService struct {
    dataPath string
    chatsPath string
    groupsPath    string
    groupChatsPath string
    defaultUser string
}

func NewSillyTavernService() *SillyTavernService {
    return &SillyTavernService{
        dataPath: config.GetSTDataPath(),
        chatsPath: config.STChatsPath,
        groupsPath: config.STGroupsPath,
        groupChatsPath: config.STGroupChatsPath,
        defaultUser: config.STDefaultUser,
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
