# 🔄 RAGFlow Data Ingestion Guide

This guide shows you **3 ways** to feed data into your RAGFlow instance for the Docsyte MCP server.

## 🏃‍♂️ Quick Start

Your RAGFlow is running at: **http://localhost:80**

## 📋 **Method 1: Web UI (Easiest)**

### Step 1: Access RAGFlow
1. Open http://localhost:80 in your browser
2. Create an account or sign in

### Step 2: Get API Key
1. Click your avatar (top right)
2. Go to **API** section  
3. Generate/copy your API key
4. Save it: `export RAGFLOW_API_KEY='your-key-here'`

### Step 3: Create Knowledge Base
1. Click **"Knowledge Base"** → **"Create"**
2. Name it (e.g., "my-docs")
3. Choose embedding model (default is fine)
4. Set chunking method (try "naive" or "book")

### Step 4: Upload Documents
1. Select your knowledge base
2. Click **"Upload"**
3. Drag & drop files or browse
4. Supported: PDF, DOC, TXT, MD, HTML, etc.

### Step 5: Process Documents
1. Wait for upload to complete
2. Click **"Parse"** to start processing
3. Monitor progress in the UI

## 🛠️ **Method 2: Script-Based (Automated)**

### Using the Bash Script

```bash
# Get your API key from the web UI first
export RAGFLOW_API_KEY='your-api-key-here'

# Run the ingestion script
./ragflow-ingest.sh
```

The script will:
- ✅ Test connection to RAGFlow
- 📚 List existing knowledge bases  
- 🏗️ Create a new knowledge base called "docsyte-docs"
- 📄 Show you how to upload documents
- 🔍 Test search functionality

### Upload Documents with the Script

Edit `ragflow-ingest.sh` and add:

```bash
# Upload documents (add after knowledge base creation)
upload_document "$dataset_id" "/path/to/your/document.pdf"
upload_document "$dataset_id" "/path/to/your/readme.md"
upload_document "$dataset_id" "/path/to/your/docs.txt"
```

## 🔧 **Method 3: Direct API (Advanced)**

### Create Knowledge Base

```bash
curl -X POST "http://localhost:80/api/v1/datasets" \
  -H "Authorization: Bearer $RAGFLOW_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "my-knowledge-base",
    "description": "My documentation",
    "embedding_model": "BAAI/bge-large-zh-v1.5@BAAI",
    "chunk_method": "naive",
    "parser_config": {
      "chunk_token_num": 512,
      "delimiter": "\n"
    }
  }'
```

### Upload Document

```bash
curl -X POST "http://localhost:80/api/v1/datasets/{dataset_id}/documents" \
  -H "Authorization: Bearer $RAGFLOW_API_KEY" \
  -F "file=@/path/to/document.pdf"
```

### Search Documents

```bash
curl -X POST "http://localhost:80/api/v1/retrieval" \
  -H "Authorization: Bearer $RAGFLOW_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "search query",
    "dataset_ids": ["your-dataset-id"],
    "top_k": 5
  }'
```

## 📊 **Supported File Types**

- **Documents**: PDF, DOC, DOCX, TXT, MD
- **Presentations**: PPT, PPTX  
- **Spreadsheets**: XLS, XLSX
- **Web**: HTML, JSON
- **Email**: EML
- **Images**: PNG, JPG (with OCR)

## ⚙️ **Configuration Options**

### Chunking Methods
- **naive**: Simple text splitting
- **book**: For book-like documents
- **paper**: For academic papers
- **presentation**: For slide decks
- **manual**: Custom chunking

### Embedding Models
- `BAAI/bge-large-zh-v1.5@BAAI` (default)
- `embedding-3@ZHIPU-AI`
- `text-embedding-ada-002@OPENAI` (requires OpenAI key)

## 🔗 **Connect to Your MCP Server**

After uploading documents, update your `.env`:

```bash
# Required
RAGFLOW_URL=http://localhost:80
RAGFLOW_API_KEY=your-api-key-here

# Optional (for better embeddings)
OPENAI_API_KEY=your-openai-key
```

Then test your MCP server:

```bash
cd apps/mcp-server
node dist/index.js
```

## 🎯 **Example Workflow**

1. **Start RAGFlow**: `cd ragflow/docker && docker-compose up -d`
2. **Get API Key**: Visit http://localhost:80 → Avatar → API
3. **Set Environment**: `export RAGFLOW_API_KEY='your-key'`
4. **Run Script**: `./ragflow-ingest.sh`
5. **Upload Docs**: Via web UI or script
6. **Test MCP**: `node apps/mcp-server/dist/index.js`
7. **Query Data**: Use MCP tools in your IDE

## 🚨 **Troubleshooting**

### RAGFlow Not Running
```bash
cd ragflow/docker
docker-compose up -d
docker-compose ps  # Check status
```

### API Key Issues
- Make sure you generated the key from the web UI
- Check the key is exported: `echo $RAGFLOW_API_KEY`
- Try regenerating the key if it's not working

### Upload Failures
- Check file size (RAGFlow has limits)
- Ensure file format is supported
- Try uploading via web UI first to test

### No Search Results
- Wait for document processing to complete
- Check if documents were parsed successfully in the web UI
- Try different search queries
- Verify the knowledge base has processed documents

## 🎉 **What's Next?**

Once you have data in RAGFlow:

1. **Test MCP Tools**:
   - `search_docs`: Find relevant chunks
   - `get_chunk`: Get specific content  
   - `answer_with_docs`: Get AI answers with citations

2. **Configure IDE**:
   - Add Docsyte MCP server to Claude Desktop
   - Use in VS Code with MCP extensions
   - Test with other MCP-compatible tools

3. **Scale Up**:
   - Add more knowledge bases for different projects
   - Implement automated ingestion pipelines
   - Fine-tune chunking and embedding settings

Your documentation is now searchable through the MCP protocol! 🚀