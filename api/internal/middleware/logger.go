package middleware

import (
	"time"

	"github.com/gin-gonic/gin"
)

func RequestLogger() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Start timer
		start := time.Now()

		// Process request
		c.Next()

		// Calculate latency
		latency := time.Since(start)

		// Log request details
		gin.DefaultWriter.Write([]byte(
			"Method: " + c.Request.Method + " | " +
				"Path: " + c.Request.URL.Path + " | " +
				"Status: " + string(rune(c.Writer.Status())) + " | " +
				"Latency: " + latency.String() + "\n",
		))
	}
}
