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

# 🏗️  HIGH‑LEVEL PHASES
phases:
  - id: 00_repo_init
    title: "Repo / tooling bootstrap"
    tasks:
      - "Create PNPM workspace with prettier, eslint, lint‑staged"
      - "Generate CONTRIBUTING.md (conventional commits) + CODE_OF_CONDUCT.md"
      - "Add LICENSE and basic README"
  - id: 01_ragflow_local
    title: "Spin up local RAGFlow stack"
    tasks:
      - "Docker‑compose with ragflow, postgres, qdrant"
      - "Create 'dev' knowledge‑base via RAGFlow REST API"
  - id: 02_ingestion_cli
    title: "Docs fetch / parse / chunk / embed CLI"
    tasks:
      - "Python click CLI ↔ RAGFlow REST"
      - "Fetchers: git, sitemap, pdf‑url, openapi"
      - "Chunking: heading‑aware + semantic fallback (400‑800 tok)"
  - id: 03_mcp_server
    title: "Minimal MCP server"
    tasks:
      - "Tool: search_docs(query,lib,ver,k=8)"
      - "Tool: get_chunk(chunkId)"
      - "Tool: answer_with_docs(query,lib,ver,k=8)"
      - "Transports: stdio (local) & Express HTTP (remote)"
  - id: 04_tests
    title: "Integration + regression tests"
    tasks:
      - "Vitest for TS server"
      - "Golden answer fixtures per lib/version"
  - id: 05_ci_cd
    title: "CI/CD"
    tasks:
      - "GitHub Actions: lint, test, docker build & push"
      - "Renovate bot for dependency updates"
  - id: 06_docs
    title: "Docs & examples"
    tasks:
      - "Architecture diagram (Mermaid)"
      - "Quick‑start + MCP client config snippets"
  - id: 07_stretch
    title: "Version diff + incremental re‑embed"
    tasks:
      - "Nightly cron to detect doc changes and PATCH RAGFlow KB"

# 🔗  EXTERNAL REFERENCES
references:
  - url: https://github.com/infiniflow/ragflow
  - url: https://modelcontextprotocol.io/specification
  - url: https://github.com/upstash/context7        # for inspiration only
  - url: https://www.llamaindex.ai/blog/pdf-parsing-llamaparse
  - url: https://www.ibm.com/architectures/papers/rag-cookbook/chunking

# 🗂️  REPO STRUCTURE
directory_tree: |
  .
  ├── apps/
  │   └── mcp-server/           # TypeScript (src/, test/)
  ├── packages/
  │   └── ingest-cli/           # Python package
  ├── docker/
  │   ├── docker-compose.yml
  │   └── ragflow.Dockerfile
  ├── scripts/
  │   └── KB_BOOTSTRAP.sh       # Knowledge base setup automation
  ├── tests/
  │   └── health-check.test.ts  # Development stack health checks
  ├── .github/
  │   └── workflows/
  ├── docs/
  │   ├── arch.md
  │   └── quickstart.md
  ├── .env.example              # Environment template
  ├── .gitignore
  ├── Makefile                  # Development shortcuts
  ├── README.md
  ├── LICENSE
  └── CONTRIBUTING.md

# 🧩  CODE GEN RULES (Claude)
rules:
  - "Prefer small, focused functions; ≤120 LOC per file"
  - "Every generated file starts with an auto‑generated header"
  - "Use JSDoc & zod schemas for tool inputs"
  - "Add TODO comments where human review is required"
  - "Python CLI uses argparse + tqdm for progress bars"
  - "Docker images must be multi‑arch compatible"

# ➡️  ENTRY INSTRUCTIONS TO CLAUDE
entrypoint: |
  1. Execute Phase **00_repo_init** completely.
  2. Commit as "chore: repo bootstrap".
  3. Then proceed to **01_ragflow_local**.
  4. After each phase, emit a short markdown checklist of what was created.