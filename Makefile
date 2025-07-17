# Auto-generated: Makefile for Docsyte development shortcuts

.PHONY: dev-up dev-down dev-logs dev-status help

# Start the development stack (detached)
dev-up:
	@echo "🚀 Starting Docsyte development stack..."
	cd docker && docker compose up -d
	@echo "✅ Stack started! Use 'make dev-logs' to view logs"

# Stop the development stack and remove volumes
dev-down:
	@echo "🛑 Stopping Docsyte development stack..."
	cd docker && docker compose down --volumes
	@echo "✅ Stack stopped and volumes removed"

# View logs from all services
dev-logs:
	@echo "📋 Viewing development stack logs..."
	cd docker && docker compose logs -f

# Check status of all services
dev-status:
	@echo "📊 Development stack status:"
	cd docker && docker compose ps

# Show available commands
help:
	@echo "📖 Available Docsyte development commands:"
	@echo "  make dev-up      - Start development stack (detached)"
	@echo "  make dev-down    - Stop stack and remove volumes"
	@echo "  make dev-logs    - View logs from all services"
	@echo "  make dev-status  - Check service status"
	@echo "  make help        - Show this help message"