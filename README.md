# SillyTavern Chat Summarizer

> :warning: 95% of this application was generated by Gen AI as a fun experiment ([Claude AI](https://claude.ai/))
> (the remaining 5% was where intervention was required)

## What is this?

- [SillyTavern](https://github.com/SillyTavern/SillyTavern) is a chat-based system for role-playing that integrate with various LLMs.
- While using SillyTavern, there is a **Summarize** feature that occasionally uses the primary LLM to summarize the chat in order to allow your story to continue after you've passed the traditional context window
- **Summarize** has 3 options - Main LLM, SillyTavern Extras, or WebLLM
    - The problem comes when you use something like a reasoning model for your main LLM, which doesn't always summarize properly (or at all)
    - SillyTavern Extras could be an alternative, but doesn't offer the ability to summarize on demand
    - WebLLM isn't available in all browsers or devices
    - Hence, as a fun experiment, I created this project to use Ollama to summarize any chat at any point

### Why did you use Gen AI for everything?

- Just to see the current state of Gen AI ;)

### Findings

- [Findings](./doc/findings.md)

### Prompts

- [Prompts](./doc/prompts.md)

---

> :warning: Everything below was AI generated

A web application for exploring and analyzing chat data with integrated LLM summarization capabilities.

## Prerequisites

- Docker and Docker Compose
- Ollama running locally (for LLM features)
- Node.js 12+ (for local development)
- Go 1.24+ (for local development)

## Setup

1. Clone the repository:
```bash
git clone https://github.com/craigstjean/st-chat-summarizer.git
cd st-chat-summarizer
```

2. Create a symbolic link to your data directory:
```bash
ln -s /path/to/your/SillyTavern-Launcher/SillyTavern/data ./data
```

Or, if you did not use the Launcher:
```bash
ln -s /path/to/your/SillyTavern/data ./data
```

3. Ensure Ollama is running locally on port 11434 on host 0.0.0.0.
```bash
OLLAMA_HOST=0.0.0.0 ollama serve
```

4. Ensure Ollama has models to work with. If you need a starting model, try:
```bash
ollama pull llama3.2
```

## Running with Docker

Start all services:
```bash
docker compose up -d
```

The application will be available at:
- Frontend: http://localhost:3000
- API: http://localhost:3000/api

View logs:
```bash
docker compose logs -f
```

Stop all services:
```bash
docker compose down
```

## Local Development

### Frontend (Next.js)

1. Navigate to the web directory:
```bash
cd web
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at http://localhost:3000

### Backend (Go/Gin)

1. Navigate to the api directory:
```bash
cd api
```

2. Install dependencies:
```bash
go mod download
```

3. Run the server:
```bash
go run .
```

The API will be available at http://localhost:8080

## Configuration

### Environment Variables

Frontend:
- `NEXT_PUBLIC_API_BASE_URL`: URL for the backend API

Backend:
- `GIN_MODE`: Gin framework mode (debug/release)
- `DATA_PATH`: Path to chat data directory
- `OLLAMA_HOST`: Hostname for Ollama service
- `OLLAMA_PORT`: Port for Ollama service
- `ST_DATA_PATH`: Path to SillyTavern data directory

## Architecture

- Frontend: Next.js with TypeScript and Tailwind CSS
- Backend: Go with Gin framework
- Proxy: Nginx for routing and serving
- LLM Integration: Ollama for chat summarization

## Features

- Browse chat history by character or group
- View detailed chat content
- Generate chat summaries using LLM
- Responsive design
- Real-time navigation with browser history support

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

[Unlicense LICENSE.md](LICENSE.md)
