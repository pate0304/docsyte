# Contributing to Docsyte

Thank you for your interest in contributing to Docsyte! This document provides guidelines and information about contributing to this project.

## Development Setup

### Prerequisites

- Node.js 20+ and pnpm 8+
- Python 3.10+ (for the ingestion CLI)
- Docker and Docker Compose (for RAGFlow stack)

### Initial Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd docsyte
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Install Python dependencies:
   ```bash
   cd packages/ingest-cli
   pip install -e .[dev]
   ```

## Commit Message Convention

This project follows [Conventional Commits](https://conventionalcommits.org/) specification. All commit messages must be structured as follows:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, etc)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **chore**: Changes to the build process or auxiliary tools and libraries

### Examples

```
feat(mcp-server): add search_docs tool
fix(ingest-cli): handle PDF parsing errors gracefully
docs: update quickstart guide
chore: bump dependencies
```

### Scope

The scope should be one of the following:
- `mcp-server` - TypeScript MCP server
- `ingest-cli` - Python ingestion CLI
- `docker` - Docker configuration
- `docs` - Documentation

## Pull Request Process

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feat/your-feature-name`
3. **Make** your changes following the coding standards
4. **Test** your changes: `pnpm test` and `pnpm lint`
5. **Commit** your changes using conventional commit format
6. **Push** to your fork: `git push origin feat/your-feature-name`
7. **Submit** a pull request

### Pull Request Requirements

- [ ] Code follows the project's coding standards
- [ ] Tests pass locally (`pnpm test`)
- [ ] Linting passes (`pnpm lint`)
- [ ] Type checking passes (`pnpm typecheck`)
- [ ] Commit messages follow conventional commit format
- [ ] PR description clearly describes the changes

## Code Style

### TypeScript

- Use TypeScript strict mode
- Prefer explicit types over `any`
- Use JSDoc comments for public APIs
- Follow ESLint and Prettier configurations
- Maximum 120 lines per file (prefer smaller, focused functions)

### Python

- Follow PEP 8 style guide
- Use Black for code formatting
- Use Ruff for linting
- Type hints are required for all functions
- Use docstrings for all public functions

## Testing

### TypeScript

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch
```

### Python

```bash
# Run tests
cd packages/ingest-cli
python -m pytest

# Run with coverage
python -m pytest --cov=src/
```

## Development Workflow

1. **Check** existing issues before starting work
2. **Discuss** major changes in an issue first
3. **Write tests** for new functionality
4. **Update documentation** when needed
5. **Follow** the conventional commit format

## Getting Help

- Open an issue for bugs or feature requests
- Join discussions in existing issues
- Check the documentation in the `docs/` directory

## License

By contributing to Docsyte, you agree that your contributions will be licensed under the MIT License.