# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Build/Test Commands
- `npm install` - Install dependencies
- `npm run build` - Build the TypeScript server (target for stdio MCP)
- `npm run dev` - Run development server (type-checks on changes)
- `npm start` - Run production build
- Tests: Run from project root with `npx vitest`

## Code Style
- **Imports**: Order by type (external → internal → types), group by category. Import from `src/` not `./`
- **JSON Output**: Compact JSON (no pretty-print), parse thoughtfully to avoid context bloat. Use `JSON.stringify(result, null, 2)` only for error responses.
- **Naming**: PascalCase for files, camelCase for variables. Use `query`, `id`, `result` for clear short names.
- **Error Handling**: Throw errors from HTTP requests naturally; parse response text before JSON.parse to avoid NaN results.
- **TypeScript**: Strict types on tool inputs/outputs, `any` only with explicit `. // eslint-disable-line @typescript-eslint/no-explicit-any`.

## Architecture
- **Main Entry**: [`src/index.ts`](src/index.ts) handles stdio MCP protocol and tool invocation.
- **Tool Pattern**: Each tool follows: parse args → call specific handler → compress JSON response.
- **HTTP**: Axios for all requests; parse response text, then JSON to prevent NaN.
- **arXiv API**: `http://export.arxiv.org/api/query` (search), RSS/Atom URLs for feeds. Always return `abs_url` and `pdf_url` as canonical format.
- **Bundle**: Build produces single `dist/index.js` for stdio stdio MCP; don't use other barrel files.

## Tool Details
- `arxiv_search`: Accepts query, start, max_results, sort_by, sort_order. Output: array of papers with id, title, summary.
- `arxiv_get_paper`: Accepts id. Output: full metadata including abs_url, pdf_url, HTML abstract.
- `arxiv_get_feed`: Accepts category, format, limit. Output: array of papers from RSS/Atom feed.
- `arxiv_get_pdf_url`: Accepts id. Output: object with abs_url, pdf_url (canononical pattern from arXiv).

## Configuration
- **OpenCode MCP**: Configure in `opencode.json` with `type: "local"`, command as array, avoid deep tree (throttle requests if applicable).
