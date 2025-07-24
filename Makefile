# Auto-generated: Makefile for Docsyte development shortcuts

.PHONY: dev-up dev-down dev-logs dev-status help

# Start the development stack (NOP - using managed backends)
dev-up:
	@echo "⚠️  Local Docker stack removed - using managed RAG backends"
	@echo "📖 See README.md for backend configuration options"

# Stop the development stack (NOP - using managed backends)
dev-down:
	@echo "⚠️  Local Docker stack removed - using managed RAG backends"
	@echo "📖 See README.md for backend configuration options"

# View logs (NOP - using managed backends)
dev-logs:
	@echo "⚠️  Local Docker stack removed - using managed RAG backends"
	@echo "📖 Check your managed service dashboards for logs"

# Check status (NOP - using managed backends)
dev-status:
	@echo "⚠️  Local Docker stack removed - using managed RAG backends"
	@echo "📖 Check your managed service dashboards for status"

# Show available commands
help:
	@echo "📖 Available Docsyte development commands:"
	@echo "  make dev-up      - (NOP) Managed backends configured via .env"
	@echo "  make dev-down    - (NOP) Managed backends configured via .env"
	@echo "  make dev-logs    - (NOP) Check managed service dashboards"
	@echo "  make dev-status  - (NOP) Check managed service dashboards"
	@echo "  make help        - Show this help message"