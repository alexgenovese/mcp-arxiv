# Project Architecture Rules (Non-Obvious Only)

- **arXiv API Endpoint**: `http://export.arxiv.org/api/query` returns Atom 1.0 XML - must parse properly using XML parsers (not JSON).
- **Feed RSS URLs**: For categories, use `https://rss.arxiv.org/rss/{category}` or `https://rss.arxiv.org/atom/{category}` based on requested format.
- **Stateless Design**: MCP tools must be stateless - each tool call handles complete request/response without shared state.
- **Response Format**: Always return `abs_url` AND `pdf_url` together for paper tools to enable agents to fetch both HTML abstracts and PDF content.
- **User-Agent**: OpenCode configures `ARXIV_USER_AGENT` environment variable - respect it when making HTTP requests to arXiv.
