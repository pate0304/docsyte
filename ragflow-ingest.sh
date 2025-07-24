#!/bin/bash

# RAGFlow Document Ingestion Script (Bash/cURL version)
# Feeds data into your RAGFlow instance for the Docsyte MCP server

set -e

# Configuration
RAGFLOW_URL="${RAGFLOW_URL:-http://localhost:80}"
RAGFLOW_API_KEY="${RAGFLOW_API_KEY:-}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔗 RAGFlow Document Ingestion Script${NC}"
echo "RAGFlow URL: $RAGFLOW_URL"

# Test connection
echo -e "\n${BLUE}Testing connection...${NC}"
if curl -s --connect-timeout 5 "$RAGFLOW_URL/api/v1/datasets" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ RAGFlow is accessible!${NC}"
else
    echo -e "${RED}❌ Cannot connect to RAGFlow at $RAGFLOW_URL${NC}"
    echo "Make sure RAGFlow is running with: cd ragflow/docker && docker-compose up -d"
    exit 1
fi

# Check if API key is provided
if [ -z "$RAGFLOW_API_KEY" ]; then
    echo -e "\n${YELLOW}🔑 API Key Required${NC}"
    echo "To upload documents, you need a RAGFlow API key:"
    echo "1. Open $RAGFLOW_URL in your browser"
    echo "2. Click your avatar → API → Generate API Key"
    echo "3. Run: export RAGFLOW_API_KEY='your-key-here'"
    echo "4. Then run this script again"
    echo ""
    echo -e "${BLUE}📚 Listing existing knowledge bases (read-only):${NC}"
    
    # Try to list knowledge bases (might work without auth)
    response=$(curl -s "$RAGFLOW_URL/api/v1/datasets" || echo "")
    if echo "$response" | grep -q "datasets"; then
        echo "$response" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if data.get('code') == 0 and 'datasets' in data.get('data', {}):
        datasets = data['data']['datasets']
        if datasets:
            for ds in datasets:
                print(f\"  - {ds.get('name', 'Unknown')} (ID: {ds.get('id', 'Unknown')})\")
        else:
            print('  No knowledge bases found')
    else:
        print('  Unable to list knowledge bases')
except:
    print('  Unable to parse response')
" 2>/dev/null || echo "  Unable to list knowledge bases"
    else
        echo "  Unable to list knowledge bases (authentication required)"
    fi
    exit 0
fi

# Functions for API calls
create_knowledge_base() {
    local name="$1"
    local description="$2"
    
    echo -e "\n${BLUE}🏗️  Creating knowledge base: '$name'${NC}"
    
    response=$(curl -s -X POST "$RAGFLOW_URL/api/v1/datasets" \
        -H "Authorization: Bearer $RAGFLOW_API_KEY" \
        -H "Content-Type: application/json" \
        -d "{
            \"name\": \"$name\",
            \"description\": \"$description\",
            \"embedding_model\": \"BAAI/bge-large-zh-v1.5@BAAI\",
            \"permission\": \"me\",
            \"chunk_method\": \"naive\",
            \"parser_config\": {
                \"chunk_token_num\": 512,
                \"delimiter\": \"\\n\",
                \"html4excel\": false,
                \"layout_recognize\": \"DeepDOC\",
                \"raptor\": {\"use_raptor\": false},
                \"graphrag\": {\"use_graphrag\": false}
            }
        }")
    
    dataset_id=$(echo "$response" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if data.get('code') == 0:
        print(data['data']['dataset_id'])
    else:
        print('ERROR: ' + data.get('message', 'Unknown error'), file=sys.stderr)
        sys.exit(1)
except Exception as e:
    print('ERROR: Invalid response', file=sys.stderr)
    sys.exit(1)
" 2>/dev/null)
    
    if [ $? -eq 0 ] && [ -n "$dataset_id" ]; then
        echo -e "${GREEN}✅ Created knowledge base with ID: $dataset_id${NC}"
        echo "$dataset_id"
    else
        echo -e "${RED}❌ Failed to create knowledge base${NC}"
        echo "Response: $response"
        return 1
    fi
}

upload_document() {
    local dataset_id="$1"
    local file_path="$2"
    
    if [ ! -f "$file_path" ]; then
        echo -e "${RED}❌ File not found: $file_path${NC}"
        return 1
    fi
    
    echo -e "${BLUE}📄 Uploading: $(basename "$file_path")${NC}"
    
    response=$(curl -s -X POST "$RAGFLOW_URL/api/v1/datasets/$dataset_id/documents" \
        -H "Authorization: Bearer $RAGFLOW_API_KEY" \
        -F "file=@$file_path")
    
    if echo "$response" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if data.get('code') == 0:
        sys.exit(0)
    else:
        print('ERROR: ' + data.get('message', 'Unknown error'), file=sys.stderr)
        sys.exit(1)
except:
    sys.exit(1)
" 2>/dev/null; then
        echo -e "${GREEN}✅ Uploaded successfully${NC}"
        return 0
    else
        echo -e "${RED}❌ Upload failed${NC}"
        echo "Response: $response"
        return 1
    fi
}

search_documents() {
    local dataset_id="$1"
    local query="$2"
    local top_k="${3:-5}"
    
    echo -e "\n${BLUE}🔍 Searching: '$query'${NC}"
    
    response=$(curl -s -X POST "$RAGFLOW_URL/api/v1/retrieval" \
        -H "Authorization: Bearer $RAGFLOW_API_KEY" \
        -H "Content-Type: application/json" \
        -d "{
            \"question\": \"$query\",
            \"dataset_ids\": [\"$dataset_id\"],
            \"top_k\": $top_k,
            \"similarity_threshold\": 0.2,
            \"vector_similarity_weight\": 0.3
        }")
    
    echo "$response" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if data.get('code') == 0:
        chunks = data['data']['chunks']
        print(f'Found {len(chunks)} results:')
        for i, chunk in enumerate(chunks[:3], 1):
            content = chunk.get('content_with_weight', chunk.get('content', 'No content'))[:200]
            print(f'  {i}. {content}...')
    else:
        print('Search failed: ' + data.get('message', 'Unknown error'))
except:
    print('Unable to parse search results')
" 2>/dev/null || echo "Search request failed"
}

# Main execution
echo -e "\n${BLUE}📚 Listing existing knowledge bases:${NC}"
response=$(curl -s -H "Authorization: Bearer $RAGFLOW_API_KEY" "$RAGFLOW_URL/api/v1/datasets")
echo "$response" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if data.get('code') == 0 and 'datasets' in data.get('data', {}):
        datasets = data['data']['datasets']
        if datasets:
            for ds in datasets:
                print(f\"  - {ds.get('name', 'Unknown')} (ID: {ds.get('id', 'Unknown')})\")
        else:
            print('  No knowledge bases found')
    else:
        print('  Unable to list knowledge bases: ' + data.get('message', 'Unknown error'))
except:
    print('  Unable to parse response')
" 2>/dev/null || echo "  Unable to list knowledge bases"

# Example: Create a test knowledge base
echo -e "\n${YELLOW}🚀 Creating example knowledge base for Docsyte...${NC}"
if dataset_id=$(create_knowledge_base "docsyte-docs" "Documentation for Docsyte MCP server"); then
    echo -e "\n${GREEN}✅ Knowledge base created successfully!${NC}"
    echo "Dataset ID: $dataset_id"
    
    echo -e "\n${BLUE}📖 Next steps:${NC}"
    echo "1. Upload documents via web UI: $RAGFLOW_URL"
    echo "2. Or use the upload_document function in this script"
    echo "3. Update your MCP server .env with:"
    echo "   RAGFLOW_URL=$RAGFLOW_URL"
    echo "   RAGFLOW_API_KEY=$RAGFLOW_API_KEY"
    
    # Example search (will be empty initially)
    search_documents "$dataset_id" "docsyte mcp server" 3
    
else
    echo -e "${RED}❌ Failed to create knowledge base${NC}"
    exit 1
fi

echo -e "\n${GREEN}🎉 RAGFlow ingestion setup complete!${NC}"