# 📚 MCP ArXiv Server

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm](https://img.shields.io/npm/v/@alexgenovese/mcp-arxiv)](https://www.npmjs.com/package/@alexgenovese/mcp-arxiv)
[![npm downloads](https://img.shields.io/npm/dm/@alexgenovese/mcp-arxiv)](https://www.npmjs.com/package/@alexgenovese/mcp-arxiv)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MCP](https://img.shields.io/badge/MCP-Protocol-9B59B6?logo=modelcontextprotocol)](https://modelcontextprotocol.io)
[![Smithery](https://img.shields.io/badge/Smithery-Available-FF6B35?logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTEyIDJMMyA3djEwbDkgNSA5LTVIN0wxMiAweiIgZmlsbD0id2hpdGUiLz48L3N2Zz4=)](https://smithery.ai/server/@alexgenovese/mcp-arxiv)
[![Glama](https://img.shields.io/badge/Glama-Listed-3B82F6?logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDIgMTJzNC40OCAxMC0xMCAxMC0xMC00LjQ4LTEwLTEwUzE3LjUyIDIgMTIgMnoiIGZpbGw9IndoaXRlIi8+PC9zdmc+)](https://glama.ai/mcp/servers)
[![GitHub stars](https://img.shields.io/github/stars/alexgenovese/mcp-arxiv?style=social)](https://github.com/alexgenovese/mcp-arxiv)

An advanced [Model Context Protocol (MCP)](https://modelcontextprotocol.io) Server for accessing the [arXiv API](https://arxiv.org). This server empowers AI assistants (such as Claude Desktop, Cursor, VS Code, and Claude Code) to seamlessly search academic papers, parse full metadata, retrieve canonical PDFs, and keep up with category-specific RSS/Atom feeds.

---

## 📖 Table of Contents
1. [Project Name and Description](#project-name-and-description)
2. [Key Features](#key-features)
3. [Technology Stack](#technology-stack)
4. [Project Architecture](#project-architecture)
5. [Getting Started](#getting-started)
   - [Prerequisites](#prerequisites)
   - [Installation Options](#installation-options)
   - [MCP Client Configuration](#mcp-client-configuration)
6. [Available Tools](#available-tools)
7. [Project Structure](#project-structure)
8. [Development Workflow](#development-workflow)
9. [Coding Standards](#coding-standards)
10. [Testing](#testing)
11. [Contributing](#contributing)
12. [License](#license)
13. [Acknowledgments](#acknowledgments)

---

## Project Name and Description

**@alexgenovese/mcp-arxiv** is a developer-friendly and production-ready MCP server that bridges the gap between Large Language Models and the wealth of scientific papers hosted on **arXiv**. 

Large Language Models often struggle with outdated knowledge in rapidly evolving fields such as Deep Learning, Quantum Computing, or Astrophysics. By exposing arXiv as an MCP server, agents can query and retrieve highly structured, real-time academic metadata, abstracts, and direct links to full PDF contents.

---

## Key Features

- 🔍 **Flexible Searching**: Full-text and targeted queries across title, abstract, authors, and categories.
- 🔗 **Canonical Link Enrichment**: Always guarantees the concurrent output of both `abs_url` (abstract web page) and `pdf_url` (direct link to paper PDF) to facilitate subsequent fetching by downstream agents.
- 🌾 **Feed Consumption**: Stream and parse real-time academic RSS/Atom feeds for specific subject category codes (e.g., `cs.AI`, `quant-ph`).
- ⏱️ **Automatic Throttling**: Embedded rate limiting (100ms sleep intervals between client-side operations) to strictly adhere to arXiv's usage policies and prevent IP blocks.
- 🧱 **Structured JSON Outputs**: Outputs compacted and strictly typed JSON payloads, minimizing token overhead and preventing LLM context bloat.
- 📦 **Multi-channel Installable**: Ready-to-go npm package, complete with Smithery and Glama registry listings.

---

## Technology Stack

- **Primary Language**: TypeScript (v5.3.3)
- **Runtime Environment**: Node.js (>= v18.0.0, ESM module-based execution)
- **Core Dependencies**:
  - `@modelcontextprotocol/sdk` (v1.0.0) — High-quality implementation of the Model Context Protocol.
  - `axios` (v1.7.2) — Robust HTTP client for fetching Atom 1.0 XML feeds.
  - `fast-xml-parser` (v4.4.1) — Fast, safe XML parsing without heavy native dependencies.
- **Development Tools**:
  - `vitest` (v1.3.1) — Modern, lightning-fast test runner for unit and integration testing.
  - `ts-node` (v10.9.2) — TypeScript execution engine for development loop testing.

---

## Project Architecture

The `@alexgenovese/mcp-arxiv` server is structured as a single-bundle stdio-based CLI tool. It interacts over standard input/output (stdio) with MCP-compatible clients (like Claude Desktop) and executes asynchronous queries to arXiv's official REST API endpoints.

### Request-Response Flow

```
+--------------------+               +-----------------------+               +---------------------+
|                    |               |                       |               |                     |
|  MCP Client        | (stdio JSON)  |  mcp-arxiv Server     |  (HTTP GET)   |  ArXiv API Endpoint |
|  (Claude/Cursor)   |<------------->|  (src/index.ts)       |<------------->|  (export.arxiv.org) |
|                    |               |                       |               |                     |
+--------------------+               +-----------+-----------+               +---------------------+
                                                 |
                                                 | (Parse Atom XML)
                                                 v
                                     +-----------------------+
                                     |  XML Parser & Typings |
                                     |  (src/xml_parser.ts)  |
                                     +-----------------------+
```

1. **Client Invocation**: The user instructs an AI assistant. The assistant identifies the corresponding tool registered by the server and calls it using JSON-RPC via stdio.
2. **Server Routing**: `src/index.ts` captures the input schema, validates it with `zod`, and forwards the sanitized parameters to the query builder inside `src/api_client.ts`.
3. **Throttled Request**: The HTTP Client performs rate-limit safety sleeps, fires the request via `axios`, and captures the raw Atom 1.0 XML response.
4. **Parsing & Normalization**: The parser inside `src/xml_parser.ts` safely processes the XML, converts namespaces, extracts author metadata, compiles canonical links, and outputs compact structures.
5. **Clean Response**: Normalized JSON results containing complete metadata alongside the mandatory `abs_url` and `pdf_url` are returned back to the MCP Client.

---

## Getting Started

### Prerequisites

- **Node.js**: Version `18.0.0` or higher.
- **npm** (comes with Node) or **pnpm** (recommended for speed and efficiency).

### Installation Options

#### Option A: Global Installation via npm (Recommended)
You can directly pull the precompiled server from the public npm registry:
```bash
# Using npm
npm install -g @alexgenovese/mcp-arxiv

# Using pnpm
pnpm add -g @alexgenovese/mcp-arxiv
```

#### Option B: Build from Source (For Developers)
To customize or run the server in development mode, clone the repository and build:
```bash
# Clone repository
git clone https://github.com/alexgenovese/mcp-arxiv.git
cd mcp-arxiv

# Install all dependencies
npm install

# Build the TypeScript project
npm run build
```

#### Option C: Smithery Installation
Automated discovery and installation via the Smithery registry:
```bash
npx smithery install @alexgenovese/mcp-arxiv
```

#### Option D: Glama Installation
Discover and setup using Glama's tool installer:
```bash
npx glama install @alexgenovese/mcp-arxiv
```

---

### MCP Client Configuration

To make this server available to your AI tool of choice, add it to your configuration file (e.g., `claude_desktop_config.json` for Claude Desktop, or project-specific `.cursor/mcp.json` for Cursor).

#### Using the globally installed npm package:
```json
{
  "mcpServers": {
    "arxiv": {
      "command": "mcp-arxiv"
    }
  }
}
```

#### Using the compiled source code (Node.js):
```json
{
  "mcpServers": {
    "arxiv": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-arxiv/dist/index.js"]
    }
  }
}
```

#### Using ts-node for development on source files:
```json
{
  "mcpServers": {
    "arxiv": {
      "command": "npx",
      "args": ["tsx", "src/index.ts"],
      "cwd": "/absolute/path/to/mcp-arxiv"
    }
  }
}
```

---

## Available Tools

The server registers six robust tools with the Model Context Protocol. Each tool is designed to compress results to protect LLM context windows.

### 1. `arxiv_search`
Search across thousands of arXiv papers by query. Supports advanced sorting and date-range filters.

* **Input Arguments**:
  - `query` (string, required): Full-text search string (e.g., `"neural architecture search"`).
  - `start` (number, optional): Offset for paginating results (starts at `1`).
  - `max_results` (number, optional): Maximum results per request (default `10`, maximum constraint of `20`).
  - `sort_by` (string, optional): Sort sorting metric (`'submittedDate'`, `'lastUpdatedDate'`, `'relevance'`, `'timestamp'`).
  - `sort_order` (string, optional): Sorting direction (`'descending'` or `'ascending'`).
  - `search_field` (string, optional): Field scope (`'all_text'`, `'titles'`, `'abstracts'`, `'author'`).
  - `date_from` / `date_to` (string, optional): ISO date filter formats.
  - `category` (string, optional): Target specific subject categories (e.g., `'cs.LG'`).

* **Returns**: An array of objects with normalized IDs, titles, publication timestamps, authors, categories, comments, DOIs, abstract links, and canonical PDF URLs.

---

### 2. `arxiv_get_paper`
Retrieve deep metadata, abstracts, and identifiers for a specific paper given its unique arXiv ID.

* **Input Arguments**:
  - `paper_id` (string, required): ArXiv identifier (e.g., `"2401.12345"`).

* **Returns**: Detailed document metadata, complete author lists with affiliations, raw comments, DOI fields, and standard URLs.

---

### 3. `arxiv_get_pdf_url`
Directly retrieves the absolute alternate, PDF, and HTML-equivalent URLs for a paper ID. Helpful for downloading pdf files.

* **Input Arguments**:
  - `paper_id` (string, required): ArXiv identifier (e.g., `"2401.12345"`).

* **Returns**:
  ```json
  {
    "id": "2401.12345",
    "abs_url": "https://arxiv.org/abs/2401.12345",
    "pdf_url": "https://arxiv.org/pdf/2401.12345.pdf",
    "html_url": "https://arxiv.org/html/2401.12345"
  }
  ```

---

### 4. `arxiv_query_authors`
Find papers associated with a specific researcher.

* **Input Arguments**:
  - `author` (string, required): Full or partial name of the author (e.g., `"Yann LeCun"`).
  - `max_results` (number, optional): Limit on returned results.

* **Returns**: Array of matching papers with their titles, authors list, and abstract URLs.

---

### 5. `arxiv_get_feed`
Access the raw RSS or Atom category feeds to capture the latest daily submissions in a field.

* **Input Arguments**:
  - `category` (string, required): ArXiv category code (e.g., `"cs.CV"`, `"quant-ph"`, `"astro-ph"`).
  - `format` (string, optional): `'atom'` or `'rss'` feed format.
  - `max_results` (number, optional): Maximum papers to pull (default `10`).

---

### 6. `arxiv_related_papers`
Identify potential related documents based on the topic keywords, titles, or categories of a reference paper.

* **Input Arguments**:
  - `paper_id` (string, required): Reference paper ID.

---

## Project Structure

```
mcp-arxiv/
├── .gitignore              # Files ignored by git
├── AGENTS.md               # Guidelines and standards for AI coding agents
├── arxiv-api-analysis.md   # Architectural design and analysis of the ArXiv API
├── manifest.json           # Server descriptor manifest
├── PLUGINS.md              # Publishing directories and promotion advice
├── package.json            # Project manifest (scripts, metadata, dependencies)
├── tsconfig.json           # TypeScript compilation configurations
├── smithery.yaml           # Deployment configuration for Smithery
├── src/
│   ├── index.ts            # MCP Server registration, Tool schemas, & Stdio setup
│   ├── api_client.ts       # Axios client setup, query parameters, rate limiting
│   ├── xml_parser.ts       # FastXML Parser for Atom 1.0 feeds, entry mapping
│   └── utils/
│       └── constants.ts    # Comprehensive lists of categories, codes, and sorting constraints
```

---

## Development Workflow

We provide straightforward NPM scripts to guide the server lifecycle:

- **Build**: Compiles TypeScript files into production JavaScript files under the `dist/` directory.
  ```bash
  npm run build
  ```
- **Live Watch Dev Mode**: Auto-recompiles files on any source file modification, useful for active development.
  ```bash
  npm run dev
  ```
- **Start Production**: Runs the built production file `dist/index.js` using Node.
  ```bash
  npm start
  ```
- **Test Runner**: Launches the Vitest test suite.
  ```bash
  npm test
  ```

---

## Coding Standards

When contributing to this repository, please adhere to the project standards outlined in [`AGENTS.md`](AGENTS.md):

1. **Imports Order**: Organize imports strictly by type:
   - External library imports (e.g., `axios`, `@modelcontextprotocol/sdk`).
   - Internal source imports (e.g., `./api_client.js`, `./xml_parser.js`).
   - TypeScript interface and type declarations.
2. **Compact Output**: Keep tool output payloads compact. Avoid verbose pretty-printing (`JSON.stringify(..., null, 2)`) except inside explicit error diagnostics or single paper detail view, as it causes massive LLM context bloat.
3. **TypeScript Types**: Avoid using the `any` type. If an exception must be made, strictly annotate with `// eslint-disable-line @typescript-eslint/no-explicit-any`.
4. **Safety Parsers**: Always ensure you check the response bodies of HTTP calls before parsing JSON or calling methods to prevent `NaN` or unhandled runtime failures.

---

## Testing

This repository uses **Vitest** for swift testing.
To verify there are no regressions in XML parsing, query parameter translation, or endpoint behaviors, run:

```bash
# Run tests once
npm run test

# Run tests in continuous watch mode
npx vitest watch
```

All test suites verify feed parsing, error handling states, ID normalizations, and canonical links.

---

## Contributing

We welcome contributions from the community! Feel free to report bugs, suggest features, or open pull requests.

1. **Fork** the repository to your own account.
2. **Create** a branch for your work: `git checkout -b feature/MyAwesomeFeature`.
3. **Commit** your changes following clean committing practices: `git commit -m "feat: add super filter to search tool"`.
4. **Push** to your fork: `git push origin feature/MyAwesomeFeature`.
5. **Open a Pull Request** explaining the additions or modifications.

---

## License

This project is licensed under the terms of the [MIT License](LICENSE).

---

## Acknowledgments

- Highly inspired by the [Model Context Protocol](https://modelcontextprotocol.io) created by Anthropic.
- Powered by the free, public, and invaluable metadata engine at the [arXiv API](https://arxiv.org/help/api).
