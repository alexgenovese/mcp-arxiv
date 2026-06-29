# MCP ArXiv Server

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm](https://img.shields.io/npm/v/@alexgenovese/mcp-arxiv)](https://www.npmjs.com/package/@alexgenovese/mcp-arxiv)
[![npm downloads](https://img.shields.io/npm/dm/@alexgenovese/mcp-arxiv)](https://www.npmjs.com/package/@alexgenovese/mcp-arxiv)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MCP](https://img.shields.io/badge/MCP-Protocol-9B59B6?logo=modelcontextprotocol)](https://modelcontextprotocol.io)
[![Smithery](https://img.shields.io/badge/Smithery-Available-FF6B35?logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTEyIDJMMyA3djEwbDkgNSA5LTVIN0wxMiAweiIgZmlsbD0id2hpdGUiLz48L3N2Zz4=)](https://smithery.ai/server/@alexgenovese/mcp-arxiv)
[![Glama](https://img.shields.io/badge/Glama-Listed-3B82F6?logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMTNy41MiAyIDEyIDJ6bTAgMThjLTQuNDEgMC04LTMuNTgtOC04czMuNTgtOCA4LTggOCAzLjU4IDggOC0zLjU4IDgtOCA4eiIgZmlsbD0id2hpdGUiLz48L3N2Zz4=)](https://glama.ai/mcp/servers)
[![GitHub stars](https://img.shields.io/github/stars/alexgenovese/mcp-arxiv?style=social)](https://github.com/alexgenovese/mcp-arxiv)

An [MCP Server](https://modelcontextprotocol.io) for accessing the [arXiv API](https://arxiv.org). Enables AI assistants to search papers, retrieve metadata, and access PDFs from arXiv.

## Features

- 📚 Search arXiv papers by query
- 📄 Retrieve full paper metadata by ID
- 🔗 Direct links to abstract and PDF URLs
- 🚀 Fast XML parsing for Atom feed responses
- ✅ TypeScript with strict typing

## Installation

### From npm (Recommended)

```bash
# Install via npm
npm install -g @alexgenovese/mcp-arxiv

# Or via pnpm
pnpm add -g @alexgenovese/mcp-arxiv

# Or via yarn
yarn add -g @alexgenovese/mcp-arxiv
```

### Build from Source

```bash
git clone https://github.com/alexgenovese/mcp-arxiv.git
cd mcp-arxiv
npm install
npm run build
```

### Installation via Smithery

```bash
# Install via smithery
npx smithery install @alexgenovese/mcp-arxiv
```

```bash
# Or stream via smithery
npx smithery stream @alexgenovese/mcp-arxiv

# Run locally with smithery
npx @smithery/cli r @alexgenovese/mcp-arxiv
```

### Installation via Glama

```bash
# Glama provides MCP discovery and installation
npx glama install @alexgenovese/mcp-arxiv
```

## Usage

### Configure your MCP Client

Add the MCP server configuration to your MCP client (Cursor, VS Code, Claude Desktop, etc.):

**Compiled version (recommended):**

```json
{
  "mcpServers": {
    "arxiv": {
      "command": "node",
      "args": ["./dist/index.js"]
    }
  }
}
```

**Development version (with source rebuild):**

```json
{
  "mcpServers": {
    "arxiv": {
      "command": "npx",
      "args": ["tsx", "src/index.ts"],
      "cwd": "/path/to/mcp-arxiv"
    }
  }
}
```

### Available Tools

The MCP server provides the following tools:

#### 🔍 `arxiv_search`
Search for papers on arXiv by query.

```json
{
  "name": "arxiv_search",
  "arguments": {
    "query": "machine learning neural networks",
    "start": 0,
    "max_results": 10,
    "sort_by": "relevance",
    "sort_order": "descending"
  }
}
```

Parameters:
- `query`: Search query string (required)
- `start`: Starting index for pagination (default: 1)
- `max_results`: Maximum number of results (default: 10, max: 20)
- `sort_by`: `"submittedDate"` (publication date), `"lastUpdatedDate"`, `"relevance"`, or `"timestamp"` (default: `"submittedDate"`)
- `sort_order`: `"ascending"` or `"descending"` (default: `"descending"`)

Returns: Array of papers with `id`, `title`, `summary`, `abs_url`, `pdf_url`, `html_url`, `published`, `authors`, `categories`, `comment`, `doi`, and `journal_ref`.

#### 📄 `arxiv_get_paper`
Retrieves full metadata for a specific paper by ID.

```json
{
  "name": "arxiv_get_paper",
  "arguments": {
    "paper_id": "2401.00000"
  }
}
```

Parameters:
- `paper_id`: arXiv paper ID (e.g., "2401.00000")

Returns: Full paper metadata including ID, title, authors, abstract, categories, URLs, and comments.

#### 📥 `arxiv_get_feed`
Retrieves papers from an arXiv category feed (RSS/Atom).

```json
{
  "name": "arxiv_get_feed",
  "arguments": {
    "format": "atom",
    "category": "cs.AI",
    "limit": 20,
    "publishedInMonths": 3
  }
}
```

Parameters:
- `format`: "atom" or "rss" (default: "atom")
- `category`: arXiv category (e.g., "cs.AI", "physics", "quant-ph")
- `limit`: Maximum number of papers (default: 20)
- `publishedInMonths`: Papers from last N months (default: 12, max: 24)

Returns: Array of papers from the specified category.

#### 🔗 `arxiv_get_pdf_url`
Retrieves canonical absolute and PDF URLs for a paper ID.

```json
{
  "name": "arxiv_get_pdf_url",
  "arguments": {
    "paper_id": "2401.00000"
  }
}
```

Parameters:
- `paper_id`: arXiv paper ID

Returns: Absolute, PDF, and HTML URLs for the specified paper.

## Development

```bash
# Install dependencies
npm install

# Run development server with type checking
npm run dev

# Build production version
npm run build

# Run tests
npm test
```

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please read our code of conduct before contributing.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Acknowledgments

- Built with [Model Context Protocol](https://modelcontextprotocol.io)
- Data from [arXiv API](https://arxiv.org/help/api)
