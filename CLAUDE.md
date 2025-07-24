# 📂  PROJECT METADATA
name: docsyte                     # unique, brandable
description: >
  Docsyte is an open‑source Model Context Protocol (MCP) server that
  ingests multi‑format documentation, chunks & embeds it with RAGFlow,
  and delivers tiny, citation‑rich context packs to IDE‑based copilots.
  (Think Context7 capabilities, but fully semantic, token‑efficient, and OSS.)
license: MIT
language: typescript              # Node 20+ (ESM)
secondary_languages:
  - python                        # ingestion CLI
  - bash
version: 0.1.0‑alpha
status: ✅ CORE_SYSTEM_OPERATIONAL

# 🏗️  IMPLEMENTATION STATUS
phase_status:
  - id: 00_repo_init
    title: "Repo / tooling bootstrap"
    status: ✅ COMPLETED
    achievements:
      - "PNPM workspace configured with ESM, TypeScript"
      - "ESLint, Prettier, lint‑staged setup"
      - "Project structure established"
  - id: 01_ragflow_local
    title: "RAGFlow backend integration"
    status: ✅ COMPLETED
    achievements:
      - "RAGFlow Docker stack running (localhost:80)"
      - "API authentication working (API key: ragflow-MxZTBhMGNjNjg0YTExZjBiNjUwYjJlZj)"
      - "Knowledge base 'docsyte-docs' created (ID: cebe5adc684a11f08afdb2ef6c1ade51)"
      - "Document upload & processing pipeline operational"
  - id: 02_ingestion_tools
    title: "Document ingestion system"
    status: ✅ PROTOTYPE_READY
    achievements:
      - "Bash-based upload script (./upload-docs.sh)"
      - "RAGFlow REST API integration functional"
      - "Sample documents uploaded and processed"
      - "Supports: PDF, DOC, TXT, MD, HTML files"
  - id: 03_mcp_server
    title: "MCP server implementation"
    status: ✅ FULLY_OPERATIONAL
    achievements:
      - "✅ search_docs: Semantic search with RAGFlow integration"
      - "✅ get_chunk: Direct chunk retrieval by ID"
      - "✅ answer_with_docs: Q&A with source citations"
      - "✅ stdio transport working for IDE integration"
      - "✅ Real-time connection to RAGFlow data"
      - "✅ Fallback system for offline scenarios"
  - id: 04_testing
    title: "System validation"
    status: ✅ VERIFIED
    achievements:
      - "End-to-end MCP protocol testing complete"
      - "Real document retrieval from RAGFlow confirmed"
      - "Tool integration with actual data working"
  - id: 05_deployment_ready
    title: "Production readiness"
    status: 🔄 IN_PROGRESS
    achievements:
      - "✅ TypeScript compilation working"
      - "✅ Environment configuration complete"
      - "🔄 CI/CD pipeline (future)"
  - id: 06_documentation
    title: "User guides & setup"
    status: ✅ COMPLETED
    achievements:
      - "RAGFLOW_SETUP.md: Complete ingestion guide"
      - "Upload scripts with usage examples"
      - "Configuration templates and examples"

# 🔗  EXTERNAL REFERENCES
references:
  - url: https://github.com/infiniflow/ragflow
  - url: https://modelcontextprotocol.io/specification
  - url: https://github.com/upstash/context7        # for inspiration only
  - url: https://www.llamaindex.ai/blog/pdf-parsing-llamaparse
  - url: https://www.ibm.com/architectures/papers/rag-cookbook/chunking

# 🗂️  CURRENT REPO STRUCTURE
directory_tree: |
  .
  ├── apps/
  │   └── mcp-server/           # ✅ TypeScript MCP server (OPERATIONAL)
  │       ├── src/
  │       │   ├── index.ts      # Main MCP server entry point
  │       │   └── providers/
  │       │       ├── ragflow.ts # RAGFlow API integration
  │       │       └── index.ts   # Provider exports
  │       ├── dist/             # Compiled JavaScript
  │       └── package.json
  ├── packages/
  │   └── ingest-cli/           # Python package (planned)
  ├── ragflow/                  # ✅ RAGFlow backend (RUNNING)
  │   └── docker/               # Docker compose stack
  ├── docker/
  │   └── ragflow.Dockerfile    # Custom RAGFlow image
  ├── scripts/
  │   ├── upload-docs.sh        # ✅ Document upload utility
  │   ├── ragflow-ingest.sh     # ✅ RAGFlow ingestion script
  │   └── test-mcp-*.js         # ✅ MCP server test utilities
  ├── .env                      # ✅ Environment configuration
  ├── .env.example              # Environment template
  ├── RAGFLOW_SETUP.md          # ✅ Complete setup guide
  ├── Makefile                  # Development shortcuts
  ├── README.md
  └── CLAUDE.md                 # This file

# 🧩  CODE GEN RULES (Claude)
rules:
  - "Prefer small, focused functions; ≤120 LOC per file"
  - "Every generated file starts with an auto‑generated header"
  - "Use JSDoc & zod schemas for tool inputs"
  - "Add TODO comments where human review is required"
  - "Python CLI uses argparse + tqdm for progress bars"
  - "Docker images must be multi‑arch compatible"

# 🚀  SYSTEM OPERATIONAL STATUS
current_state: |
  ✅ CORE SYSTEM FULLY OPERATIONAL
  
  The Docsyte MCP server is live and connected to RAGFlow!
  
  Quick Start:
  1. RAGFlow Web UI: http://localhost:80
  2. API Key: ragflow-MxZTBhMGNjNjg0YTExZjBiNjUwYjJlZj
  3. Knowledge Base: docsyte-docs (cebe5adc684a11f08afdb2ef6c1ade51)
  4. MCP Server: node apps/mcp-server/dist/index.js
  
  All three core MCP tools working with real data:
  - search_docs: ✅ Returns actual document content from RAGFlow
  - get_chunk: ✅ Retrieves specific chunks by ID  
  - answer_with_docs: ✅ Generates answers with source citations

# 🔧  DEVELOPMENT WORKFLOW
working_setup: |
  1. **Start RAGFlow**: Already running at localhost:80
  2. **Upload Documents**: 
     - Via Web UI: http://localhost:80
     - Via Script: ./upload-docs.sh your-file.pdf
  3. **Test MCP**: node test-mcp-with-data.js
  4. **IDE Integration**: Use MCP config in Claude Desktop/VS Code
  
  Environment Variables (in .env):
  - RAGFLOW_URL=http://localhost:80
  - RAGFLOW_API_KEY=ragflow-MxZTBhMGNjNjg0YTExZjBiNjUwYjJlZj
  - OPENAI_API_KEY=[your-key] (optional, for better embeddings)

# 🧠  PROJECT ACHIEVEMENTS & LEARNINGS
memories:
  - ✅ **Core System Complete**: Successfully built end-to-end MCP server with RAGFlow
  - ✅ **Real Data Integration**: MCP server retrieving actual document content (not fallback)
  - ✅ **API Integration Debugged**: Fixed RAGFlow API endpoint (/api/v1/retrieval) and response format
  - ✅ **Document Processing**: Upload → Chunk → Embed → Search pipeline working
  - ✅ **TypeScript Build**: Proper ESM compilation with correct module resolution
  - ✅ **MCP Protocol**: Full compliance with stdio transport and tool schemas
  - 🔧 **Port Discovery**: RAGFlow web UI on port 80, not 9380 as initially assumed
  - 🔧 **Response Format**: RAGFlow returns {code:0, data:{chunks:[]}} structure
  - 🔧 **Auth Working**: Bearer token authentication successful with generated API key
  
  **Next Priorities**:
  - Add more document types and test edge cases
  - Implement library/version filtering
  - Add CI/CD pipeline
  - Create IDE integration examples