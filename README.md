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

2. **Start RAGFlow stack**:
   ```bash
   cd docker
   docker-compose up -d
   ```

3. **Ingest documentation**:
   ```bash
   cd packages/ingest-cli
   pip install -e .
   docsyte-ingest --help
   ```

4. **Start MCP server**:
   ```bash
   cd apps/mcp-server
   pnpm build
   pnpm start
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