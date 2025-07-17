#!/bin/bash
# Auto-generated: Knowledge Base bootstrap script for Docsyte development
# Creates a 'dev' knowledge base in RAGFlow and outputs the KB ID

set -e

# Configuration
RAGFLOW_URL="${RAGFLOW_URL:-http://localhost:8000}"
KB_NAME="dev"
KB_DESCRIPTION="Development knowledge base for Docsyte"
MAX_RETRIES=30
RETRY_INTERVAL=10

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔄 Bootstrapping RAGFlow Knowledge Base...${NC}"

# Function to check if RAGFlow is healthy
check_ragflow_health() {
    curl -s -f "${RAGFLOW_URL}/health" > /dev/null 2>&1
}

# Wait for RAGFlow to be healthy
echo -e "${YELLOW}⏳ Waiting for RAGFlow to be healthy at ${RAGFLOW_URL}...${NC}"
for i in $(seq 1 $MAX_RETRIES); do
    if check_ragflow_health; then
        echo -e "${GREEN}✅ RAGFlow is healthy!${NC}"
        break
    fi
    
    if [ $i -eq $MAX_RETRIES ]; then
        echo -e "${RED}❌ RAGFlow failed to become healthy after $((MAX_RETRIES * RETRY_INTERVAL)) seconds${NC}"
        echo -e "${RED}Please check if RAGFlow is running: make dev-status${NC}"
        exit 1
    fi
    
    echo "Attempt $i/$MAX_RETRIES: RAGFlow not ready, waiting ${RETRY_INTERVAL}s..."
    sleep $RETRY_INTERVAL
done

# TODO: Human review required - RAGFlow API endpoints need to be verified
# The following API calls are based on common RAGFlow patterns but may need adjustment

# Create knowledge base
echo -e "${YELLOW}📚 Creating knowledge base '${KB_NAME}'...${NC}"

# Attempt to create knowledge base via REST API
KB_RESPONSE=$(curl -s -X POST "${RAGFLOW_URL}/api/v1/knowledge-bases" \
    -H "Content-Type: application/json" \
    -d "{
        \"name\": \"${KB_NAME}\",
        \"description\": \"${KB_DESCRIPTION}\",
        \"language\": \"en\",
        \"embedding_model\": \"${EMBEDDING_MODEL:-text-embedding-ada-002}\"
    }" || echo "API_ERROR")

if [ "$KB_RESPONSE" = "API_ERROR" ]; then
    echo -e "${RED}❌ Failed to create knowledge base${NC}"
    echo -e "${YELLOW}💡 Please manually create a knowledge base named '${KB_NAME}' in RAGFlow UI${NC}"
    echo -e "${YELLOW}   Navigate to: ${RAGFLOW_URL}${NC}"
    exit 1
fi

# Extract KB ID from response (this may need adjustment based on actual API response format)
KB_ID=$(echo "$KB_RESPONSE" | grep -o '"id"[^,]*' | grep -o '[^"]*$' || echo "")

if [ -n "$KB_ID" ]; then
    echo -e "${GREEN}✅ Knowledge base created successfully!${NC}"
    echo -e "${GREEN}📋 Knowledge Base ID: ${KB_ID}${NC}"
    echo ""
    echo -e "${YELLOW}💾 Save this KB ID for your MCP server configuration:${NC}"
    echo -e "${GREEN}RAGFLOW_KB_ID=${KB_ID}${NC}"
else
    echo -e "${YELLOW}⚠️  Knowledge base may have been created, but couldn't parse ID from response${NC}"
    echo -e "${YELLOW}📋 Response: ${KB_RESPONSE}${NC}"
    echo -e "${YELLOW}💡 Please check RAGFlow UI to find the KB ID: ${RAGFLOW_URL}${NC}"
fi

echo -e "${GREEN}🎉 Bootstrap complete!${NC}"