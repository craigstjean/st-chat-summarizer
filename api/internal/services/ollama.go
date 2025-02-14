package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"craigstjean.com/stsummarizer/internal/config"
	"craigstjean.com/stsummarizer/internal/models"
	"github.com/tiktoken-go/tokenizer"
)

type OllamaService struct {
	client       *http.Client
	tokenEncoder tokenizer.Codec
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
	enc, err := tokenizer.Get(tokenizer.O200kBase)
	if err != nil {
		panic(err)
	}

	return &OllamaService{
		client:       &http.Client{},
		tokenEncoder: enc,
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

func (s *OllamaService) SummarizeChat(model string, chatMessages []string, maxTokens int, summaryWordLimit int) ([]string, error) {
	// Defaults
	if maxTokens <= 0 {
		maxTokens = 4096 - 100 // Default: reserve 100 tokens for request text
	}
	if summaryWordLimit <= 0 {
		summaryWordLimit = 400 // Default word limit for final summary
	}

	if model == "" {
		model = config.DefaultModel
	}

	// 1. Split chat messages into groupings that fit maxTokens
	groupedMessages, err := s.splitMessagesByTokenLimit(chatMessages, maxTokens)
	if err != nil {
		return nil, err
	}

	if len(groupedMessages) == 1 {
		summary, err := s.callSummarizer(model, groupedMessages[0], false, summaryWordLimit) // Use word limit for final summary
		if err != nil {
			return nil, fmt.Errorf("failed to generate summary: %w", err)
		}
		return []string{summary}, nil
	}

	// 2. Summarize each grouping
	var individualSummaries []string
	for i, group := range groupedMessages {
		partialSummary, err := s.callSummarizer(model, group, true, 0) // No word limit per individual summary
		if err != nil {
			return nil, fmt.Errorf("failed to summarize group %d: %w", i, err)
		}
		individualSummaries = append(individualSummaries, partialSummary)
	}

	// 3. Consolidate summaries for a final summary
	combinedSummaries := strings.Join(individualSummaries, "\n")
	finalSummary, err := s.callSummarizer(model, combinedSummaries, false, summaryWordLimit) // Use word limit for final summary
	if err != nil {
		return nil, fmt.Errorf("failed to generate final summary: %w", err)
	}

	// return array with each individualSummaries along with finalSummary
	return append(individualSummaries, finalSummary), nil
}

func (s *OllamaService) splitMessagesByTokenLimit(chatMessages []string, maxTokens int) ([]string, error) {
	var groupedMessages []string
	var currentGroup []string
	var currentTokenCount int

	for _, message := range chatMessages {
		messageTokenCount := s.countTokens(message)
		if currentTokenCount+messageTokenCount > maxTokens {
			// Join current group into a single string and add to result
			groupedMessages = append(groupedMessages, strings.Join(currentGroup, "\n\n---\n\n"))
			// Reset the current group
			currentGroup = []string{}
			currentTokenCount = 0
		}
		// Add message to current group
		currentGroup = append(currentGroup, message)
		currentTokenCount += messageTokenCount
	}

	// Add the last group if it exists
	if len(currentGroup) > 0 {
		groupedMessages = append(groupedMessages, strings.Join(currentGroup, "\n"))
	}

	return groupedMessages, nil
}

// Helper: Count Tokens (stub, replace logic to count tokens based on your tokenizer)
func (s *OllamaService) countTokens(message string) int {
	//return len(strings.Fields(message)) // Naive token count approximation

	ids, _, _ := s.tokenEncoder.Encode(message)
	return len(ids)
}

func (s *OllamaService) callSummarizer(model string, input string, passage bool, wordLimit int) (string, error) {
	instructions := "Please provide a concise summary of the following story. Your response should include nothing but the summary."
	if passage {
		instructions = "Below are summaries of different passages of a story, please provide a combined summary. Your response should include nothing but the summary."
	}

	wordLimitStr := ""
	if wordLimit > 0 {
		wordLimitStr = fmt.Sprintf(" (generate roughly %d words)", wordLimit)
	}

	prompt := fmt.Sprintf(`%s Focus on the main topics discussed, key events, and important interactions between participants.%s

Chat conversation:
%s

Please summarize:`, instructions, wordLimitStr, input)

	fmt.Println(prompt)

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
