# WindSurf IDE + Docsyte MCP Server Setup

## 🚀 Quick Setup for WindSurf IDE

### 1. Prerequisites
- ✅ Local RAGFlow stack running (`docker ps` shows containers)
- ✅ MCP server built (`apps/mcp-server/dist/index.js` exists)
- ✅ WindSurf IDE installed

### 2. Configuration Steps

#### A. Build the MCP Server (if not done)
```bash
cd /Users/shiva-mac/Documents/CB/docsyte
npm install
# Note: TypeScript compilation has some issues, but basic functionality works
```

#### B. Configure WindSurf IDE
1. **Open WindSurf Settings**
2. **Navigate to**: Extensions → MCP Servers
3. **Add Configuration** using this JSON:

```json
{
  "mcpServers": {
    "docsyte": {
      "command": "node",
      "args": ["/Users/shiva-mac/Documents/CB/docsyte/apps/mcp-server/dist/index.js"],
      "env": {
        "RAGFLOW_URL": "http://localhost:9380",
        "RAGFLOW_API_KEY": "",
        "NODE_ENV": "development"
      }
    }
  }
}
```

### 3. Available MCP Tools

Once configured, you'll have access to these tools in WindSurf:

#### 🔍 `search_docs`
Search through documentation and return relevant chunks
```json
{
  "query": "How to implement authentication?",
  "library": "react",
  "version": "18.0",
  "k": 5
}
```

#### 📄 `get_chunk`
Retrieve a specific documentation chunk by ID
```json
{
  "chunkId": "doc_chunk_12345"
}
```

#### 💬 `answer_with_docs`
Answer questions using relevant documentation as context
```json
{
  "query": "What are React hooks best practices?",
  "library": "react",
  "k": 8
}
```

### 4. Testing the Setup

#### Step 1: Verify RAGFlow is Running
```bash
# Check containers
docker ps

# Test connectivity
curl http://localhost:9380
```

#### Step 2: Test MCP Server Manually
```bash
# Run the server directly to check for errors
cd /Users/shiva-mac/Documents/CB/docsyte
node apps/mcp-server/dist/index.js
```

#### Step 3: Use in WindSurf
1. Open a new chat in WindSurf
2. Try asking: "Search for React authentication patterns"
3. The MCP tools should be automatically invoked

### 5. Adding Documentation to RAGFlow

To make the MCP server useful, add some documentation:

1. **Open RAGFlow Web Interface**: http://localhost:9380
2. **Create a Knowledge Base**:
   - Name: "dev-docs"
   - Description: "Development documentation"
3. **Upload Documents**:
   - PDF files
   - Markdown files
   - Web pages via URL
4. **Wait for Processing**: Documents need to be chunked and embedded

### 6. Example Usage in WindSurf

Once you have documents in RAGFlow, try these prompts in WindSurf:

```
"Search the dev-docs for information about API authentication"

"Find examples of React component patterns in our documentation"

"What does our style guide say about naming conventions?"
```

### 7. Troubleshooting

#### MCP Server Not Starting
```bash
# Check the built files exist
ls -la apps/mcp-server/dist/

# Check for TypeScript errors
npm run build
```

#### RAGFlow Not Accessible
```bash
# Restart the stack
docker-compose -f ragflow/docker/docker-compose.yml restart

# Check logs
docker logs ragflow-server
```

#### No Search Results
- Ensure documents are uploaded to RAGFlow
- Wait for document processing to complete
- Check knowledge base has embedded chunks

### 8. Configuration Files

- **MCP Config**: `windsurf-mcp-config.json`
- **Environment**: `.env`
- **RAGFlow URL**: http://localhost:9380

### 9. Development Tips

- **Monitor MCP Logs**: The server outputs to stderr, visible in WindSurf's MCP panel
- **Test Locally**: Run `node test-ragflow.js` to verify RAGFlow connectivity
- **Update Knowledge Base**: Add new documents via RAGFlow web interface
- **Restart Server**: If you modify the MCP server, restart WindSurf to reload

---

## 🎯 Expected Workflow

1. **Upload docs** to RAGFlow → **Process & embed** → **Query via MCP in WindSurf**
2. **Ask questions** in WindSurf → **MCP searches RAGFlow** → **Returns contextual answers**
3. **Iterative development** with live documentation search integrated into your IDE

This setup gives you **semantic documentation search** directly in WindSurf, powered by your local RAGFlow instance!