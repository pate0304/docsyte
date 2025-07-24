#!/bin/bash

# Quick document upload script for RAGFlow
# Usage: ./upload-docs.sh [file1] [file2] ...

set -e

RAGFLOW_URL="http://localhost:80"
RAGFLOW_API_KEY="ragflow-MxZTBhMGNjNjg0YTExZjBiNjUwYjJlZj"
DATASET_ID="cebe5adc684a11f08afdb2ef6c1ade51"  # Your docsyte-docs knowledge base

GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}📁 RAGFlow Document Upload${NC}"
echo "Knowledge Base: docsyte-docs"
echo "Dataset ID: $DATASET_ID"
echo ""

# Function to upload a single document
upload_document() {
    local file_path="$1"
    
    if [ ! -f "$file_path" ]; then
        echo -e "${RED}❌ File not found: $file_path${NC}"
        return 1
    fi
    
    echo -e "${BLUE}📤 Uploading: $(basename "$file_path")${NC}"
    
    response=$(curl -s -X POST "$RAGFLOW_URL/api/v1/datasets/$DATASET_ID/documents" \
        -H "Authorization: Bearer $RAGFLOW_API_KEY" \
        -F "file=@$file_path")
    
    if echo "$response" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if data.get('code') == 0:
        print('SUCCESS')
        sys.exit(0)
    else:
        print('ERROR: ' + data.get('message', 'Unknown error'))
        sys.exit(1)
except:
    sys.exit(1)
" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Upload successful${NC}"
        return 0
    else
        echo -e "${RED}❌ Upload failed${NC}"
        echo "Response: $response"
        return 1
    fi
}

# Function to trigger document processing
trigger_processing() {
    echo -e "\n${BLUE}⚙️  Triggering document processing...${NC}"
    
    # Get list of document IDs
    doc_ids=$(curl -s -H "Authorization: Bearer $RAGFLOW_API_KEY" \
        "$RAGFLOW_URL/api/v1/datasets/$DATASET_ID/documents" | \
        python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if data.get('code') == 0:
        docs = data.get('data', {}).get('docs', [])
        ids = [doc['id'] for doc in docs]
        print(json.dumps(ids))
except:
    print('[]')
")
    
    if [ "$doc_ids" != "[]" ] && [ -n "$doc_ids" ]; then
        response=$(curl -s -X POST "$RAGFLOW_URL/api/v1/datasets/$DATASET_ID/chunks" \
            -H "Authorization: Bearer $RAGFLOW_API_KEY" \
            -H "Content-Type: application/json" \
            -d "{\"document_ids\": $doc_ids}")
        
        if echo "$response" | grep -q '"code":0'; then
            echo -e "${GREEN}✅ Processing started${NC}"
        else
            echo -e "${RED}❌ Failed to start processing${NC}"
            echo "Response: $response"
        fi
    else
        echo "No documents to process"
    fi
}

# If files are provided as arguments, upload them
if [ $# -gt 0 ]; then
    for file in "$@"; do
        upload_document "$file"
    done
    trigger_processing
else
    # No files provided - show usage and create sample documents
    echo "Usage: $0 [file1] [file2] ..."
    echo ""
    echo -e "${BLUE}📝 Creating sample documents for testing...${NC}"
    
    # Create sample documents
    cat > "sample-readme.md" << 'EOF'
# Docsyte MCP Server

Docsyte is an open-source Model Context Protocol (MCP) server that provides semantic search and Q&A capabilities for documentation.

## Features

- **Multi-format support**: PDF, DOC, TXT, MD, HTML files
- **Semantic search**: Vector-based document retrieval
- **Citation-rich responses**: All answers include source references
- **RAGFlow integration**: Enterprise-grade RAG processing
- **MCP protocol**: Native IDE copilot integration

## Quick Start

1. Start RAGFlow: `docker-compose up -d`
2. Upload documents via web UI or API
3. Configure MCP client with Docsyte server
4. Query your documentation through your IDE

## API Tools

- `search_docs`: Find relevant document chunks
- `get_chunk`: Retrieve specific content by ID
- `answer_with_docs`: Get AI-generated answers with citations

## Configuration

Set these environment variables:
- `RAGFLOW_URL`: Your RAGFlow instance URL
- `RAGFLOW_API_KEY`: API key for authentication
- `OPENAI_API_KEY`: For improved embeddings (optional)
EOF

    cat > "mcp-protocol-info.txt" << 'EOF'
Model Context Protocol (MCP) Overview

The Model Context Protocol is an open standard that enables AI applications to securely connect to external data sources and tools. 

Key Benefits:
- Standardized communication between AI models and external systems
- Secure, permission-based access to data
- Extensible tool and resource system
- Support for real-time data access

MCP Components:
1. Servers: Provide tools and resources (like Docsyte)
2. Clients: AI applications that consume MCP services
3. Transports: Communication layers (stdio, HTTP, WebSocket)

Docsyte implements MCP to provide:
- Documentation search capabilities
- Semantic Q&A functionality  
- Citation tracking and source references
- Integration with popular IDEs and AI tools

For more information, visit: https://modelcontextprotocol.io
EOF

    cat > "ragflow-guide.md" << 'EOF'
# RAGFlow Integration Guide

RAGFlow is the backend engine that powers Docsyte's document processing and semantic search capabilities.

## Architecture

```
Documents → RAGFlow → Vector DB → MCP Server → IDE/Client
```

## Document Processing Pipeline

1. **Ingestion**: Upload documents via web UI or API
2. **Chunking**: Split documents into semantic chunks
3. **Embedding**: Convert text to vector representations
4. **Indexing**: Store vectors in searchable database
5. **Retrieval**: Find relevant chunks for queries

## Supported Formats

- **Text**: TXT, MD, RTF
- **Office**: DOC, DOCX, PPT, PPTX, XLS, XLSX
- **Web**: HTML, XML, JSON
- **Academic**: PDF (with OCR support)
- **Images**: PNG, JPG (with text extraction)

## Configuration Options

### Chunking Methods
- **naive**: Simple text splitting
- **book**: Chapter/section aware
- **paper**: Academic paper structure
- **presentation**: Slide-based chunking

### Embedding Models
- BAAI/bge-large-zh-v1.5 (default)
- OpenAI text-embedding-ada-002
- Custom models via API

## Best Practices

1. **Document Organization**: Use clear filenames and structure
2. **Chunk Size**: 400-800 tokens for optimal retrieval
3. **Metadata**: Include document titles and descriptions
4. **Processing Time**: Allow time for embedding generation
5. **Quality Control**: Review processed chunks for accuracy

## Troubleshooting

- **Slow Processing**: Check embedding model performance
- **Poor Results**: Adjust chunk size and similarity thresholds
- **Missing Content**: Verify document parsing success
- **API Errors**: Check authentication and rate limits
EOF

    echo "Created sample documents:"
    echo "  - sample-readme.md (Docsyte overview)"
    echo "  - mcp-protocol-info.txt (MCP background)"
    echo "  - ragflow-guide.md (RAGFlow guide)"
    echo ""
    echo "Upload them with:"
    echo "  $0 sample-readme.md mcp-protocol-info.txt ragflow-guide.md"
fi

echo -e "\n${BLUE}🌐 View your knowledge base at: http://localhost:80${NC}"