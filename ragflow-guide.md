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
