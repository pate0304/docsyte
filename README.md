# 🔥 Docsyte

Open-source Model Context Protocol (MCP) server that ingests multi-format documentation, chunks & embeds it with RAGFlow, and delivers tiny, citation-rich context packs to IDE-based copilots.

*Think Context7 capabilities, but fully semantic, token-efficient, and OSS.*

## ✨ Features

- **Multi-format ingestion**: Git repos, PDFs, sitemaps, OpenAPI specs
- **Semantic chunking**: Heading-aware + semantic fallback (400-800 tokens)
- **RAGFlow integration**: Powered by enterprise-grade RAG infrastructure
- **MCP protocol**: Native IDE copilot integration
- **Citation-rich**: Every response includes source references
- **Token-efficient**: Optimized context packs for cost-effective AI interactions

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Python 3.10+
- pnpm 8+
- A managed RAG backend (see Backend Setup below)

### Backend Setup

Choose one of the following managed RAG backends:

#### Option 1: Managed RAGFlow Instance
1. Sign up for a managed RAGFlow service
2. Get your instance URL and API key
3. Set in `.env`:
   ```bash
   RAGFLOW_URL=https://your-ragflow-instance.com
   RAGFLOW_API_KEY=your-ragflow-api-key
   ```

#### Option 2: LlamaCloud
1. Sign up at [LlamaCloud](https://cloud.llamaindex.ai/)
2. Generate an API key
3. Set in `.env`:
   ```bash
   LLAMACLOUD_API_KEY=your-llamacloud-api-key
   ```

### Installation

1. **Clone and setup**:
   ```bash
   git clone <repository-url>
   cd docsyte
   pnpm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your chosen backend and OpenAI API key
   ```

3. **Start MCP server** (when ready):
   ```bash
   pnpm dev
   ```

## 📖 Documentation

- [Architecture](docs/arch.md)
- [Contributing](CONTRIBUTING.md)
- [Quick Start Guide](docs/quickstart.md)

## 🏗️ Project Structure

```
docsyte/
├── apps/
│   └── mcp-server/           # TypeScript MCP server
├── packages/
│   └── ingest-cli/           # Python ingestion CLI
├── docker/                  # RAGFlow + deps
├── docs/                    # Documentation
└── tests/                   # Integration tests
```

## 🛠️ Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Lint & format
pnpm lint
pnpm format
```

## 📄 License

MIT - see [LICENSE](LICENSE) file.

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.