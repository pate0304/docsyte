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
- Docker & Docker Compose
- pnpm 8+

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
   # Edit .env with your OpenAI API key and other settings
   ```

3. **Start development stack**:
   ```bash
   make dev-up
   ```

4. **Bootstrap knowledge base**:
   ```bash
   ./scripts/KB_BOOTSTRAP.sh
   ```

5. **Start MCP server** (when ready):
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