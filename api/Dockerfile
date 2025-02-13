# Stage 1: Builder
FROM golang:1.24-alpine AS builder

# Install git for private dependencies (if needed)
RUN apk add --no-cache git

# Set working directory
WORKDIR /app

# Copy go mod and sum files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -o server

# Stage 2: Runner
FROM alpine:latest

WORKDIR /app

# Install ca-certificates for HTTPS
RUN apk add --no-cache ca-certificates

# Create non-root user
RUN adduser -D -g '' appuser

# Create data directory and set permissions
RUN mkdir -p /app/data && chown -R appuser:appuser /app/data

# Copy binary from builder
COPY --from=builder /app/server .

# Use non-root user
USER appuser

# Expose port
EXPOSE 8080

# Start the application
CMD ["./server"]
