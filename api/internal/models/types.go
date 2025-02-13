package models

type Model struct {
	Name    string `json:"name"`
	Model   string `json:"model"`
	Default bool   `json:"default"`
}

type GroupChat struct {
	Name    string   `json:"name"`
	Members []string `json:"members"`
	Chats   []string `json:"chats"`
}

type ChatMetadata struct {
	UserName      string                 `json:"user_name"`
	CharacterName string                 `json:"character_name"`
	CreateDate    string                 `json:"create_date"`
	ChatMetadata  map[string]interface{} `json:"chat_metadata"`
}

type ChatMessage struct {
	Name    string `json:"name"`
	IsUser  bool   `json:"is_user"`
	Message string `json:"mes"`
}
