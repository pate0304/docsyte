# Auto-generated: Custom RAGFlow image for Docsyte development
# Extends official RAGFlow with CORS support and curl for health checks

FROM infiniflow/ragflow:v0.19.1-slim

# Install curl for health checks
USER root
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Configure CORS to allow all origins for development
ENV CORS_ORIGINS="*"

# Expose the standard RAGFlow port
EXPOSE 8000

# Switch back to ragflow user if it exists, otherwise use default
USER ragflow || true

# Use the default RAGFlow entrypoint
CMD ["python", "-m", "api.main"]