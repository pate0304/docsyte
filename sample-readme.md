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
