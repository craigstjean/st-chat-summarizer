package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"

	"craigstjean.com/stsummarizer/internal/config"
	"craigstjean.com/stsummarizer/internal/models"
)

type OllamaService struct {
	client *http.Client
}

type ollamaModelsResponse struct {
	Models []struct {
		Name    string `json:"name"`
		ModType string `json:"model"`
	} `json:"models"`
}

type ollamaRequest struct {
	Model    string    `json:"model"`
	Messages []message `json:"messages"`
	Stream   bool      `json:"stream"`
}

type message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type ollamaResponse struct {
	Message struct {
		Content string `json:"content"`
	} `json:"message"`
}

func NewOllamaService() *OllamaService {
	return &OllamaService{
		client: &http.Client{},
	}
}

func (s *OllamaService) GetModels() ([]models.Model, error) {
	resp, err := s.client.Get(fmt.Sprintf("%s/api/tags", config.GetOllamaBaseURL()))
	if err != nil {
		return nil, fmt.Errorf("failed to fetch models from Ollama: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("ollama API returned status code: %d", resp.StatusCode)
	}

	var ollamaResp ollamaModelsResponse
	if err := json.NewDecoder(resp.Body).Decode(&ollamaResp); err != nil {
		return nil, fmt.Errorf("failed to decode Ollama response: %w", err)
	}

	result := make([]models.Model, len(ollamaResp.Models))
	for i, model := range ollamaResp.Models {
		result[i] = models.Model{
			Name:    model.Name,
			Model:   model.ModType,
			Default: model.Name == config.DefaultModel,
		}
	}

	return result, nil
}

func (s *OllamaService) SummarizeChat(model, chatMessages string) (string, error) {
	prompt := fmt.Sprintf(`Please provide a concise summary of the following chat conversation. Focus on the main topics discussed, key events, and important interactions between participants.

Chat conversation:
%s

Please summarize:`, chatMessages)

	if model == "" {
		model = config.DefaultModel
	}

	// Prepare request
	reqBody := ollamaRequest{
		Model: model,
		Messages: []message{
			{
				Role:    "user",
				Content: prompt,
			},
		},
		Stream: false,
	}

	reqJSON, err := json.Marshal(reqBody)
	if err != nil {
		return "", fmt.Errorf("failed to marshal request: %w", err)
	}

	// Make request to Ollama
	resp, err := s.client.Post(
		fmt.Sprintf("%s/api/chat", config.GetOllamaBaseURL()),
		"application/json",
		bytes.NewBuffer(reqJSON),
	)
	if err != nil {
		return "", fmt.Errorf("failed to make request to Ollama: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("ollama API returned status code: %d", resp.StatusCode)
	}

	var ollamaResp ollamaResponse
	if err := json.NewDecoder(resp.Body).Decode(&ollamaResp); err != nil {
		return "", fmt.Errorf("failed to decode Ollama response: %w", err)
	}

	return ollamaResp.Message.Content, nil
}
