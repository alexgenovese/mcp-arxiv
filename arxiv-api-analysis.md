# ArXiv API Analysis and MCP Server Architecture Plan

## Executive Summary

This document provides a comprehensive analysis of the ArXiv API capabilities and proposes an MCP (Model Context Protocol) server architecture for the `mcp-arxiv` project. The analysis is based on the 6 official ArXiv documentation pages and application of the Project Architecture Rules.

---

## 1. ArXiv API Capabilities Overview

### Primary Endpoints

Based on arXiv API documentation, the following endpoints are available:

1. **Search Endpoint**: `http://export.arxiv.org/api/query`
   - Atom 1.0 XML format - must be parsed using proper XML parsers
   - Supports query parameters for filtering and sorting
   - Returns search results with metadata

2. **RSS/Atom Feeds**:
   - RSS format: `https://rss.arxiv.org/rss/{category}`
   - Atom format: `https://rss.arxiv.org/atom/{category}`
   - Categories: e.g., `cs.AI`, `cs.CL`, `quant-ph`, etc.

### Response Format

According to AGENTS.md project rules:
- The arXiv API returns **Atom 1.0 XML** format
- Must parse properly using XML parsers (not JSON)
- Always return both `abs_url` AND `pdf_url` together for paper tools

---

## 2. Search Parameters and Options

### Query Parameters

#### Basic Parameters
| Parameter | Description | Expected Values/Type |
|-----------|-------------|---------------------|
| `search_query` | Full-text search query | String |
| `id_list` | Comma-separated paper IDs | String |
| `start` | Starting result index (0-based) | Integer |
| `max_results` | Maximum number of results | Integer |
| `sortBy` | Sort field | `relevance`, `submittedDate`, `lastUpdatedDate` |
| `sortByOrder` | Sort order | `ascending`, `descending` |
| `output` | Response format | `atom`, `json`, `rss` |

#### Search Fields
The search across these fields (in order of priority):
- **title**, **abstract**, **all** (full text of all fields)

Example: `title:quantum searching` OR `abstract:algorithm`

#### Date Range
- **search_within**: Date range query
- Format: Accepts dates like `2010`, `2010-2024`, etc.
- Used to filter papers by publication or modification date

#### Linked Paper ID
- `link_start`: Starting index for linked papers
- `link_max_results`: Maximum linked papers per result
- `link_start_tag`: Tag for linked papers

### Filter Options (Implicit in Query)

ArXiv supports implicit filtering through:
1. **Category aggregation in search**: Query syntax with categories
2. **Date range specifications**
3. **Related paper IDs**

### Sorting Mechanisms

| Sort Field | Description |
|------------|-------------|
| `relevance` | Relevance to search query (default) |
| `submittedDate` | Date when paper was submitted |
| `lastUpdatedDate` | Date when paper was most recently updated |

Sort orders: `ascending` (default) or `descending`

---

## 3. Response Formats

### Atom 1.0 XML Response

The primary response format is **Atom 1.0 XML** containing:

```xml
<feed xmlns='http://www.w3.org/2005/Atom'>
  <title>arXiv</title>
  <id>http://arxiv.org/abs/query</id>
  <updated>2024-01-01T00:00:00Z</updated>
  
  <entry>
    <id>arXiv:2401.00001</id>
    <title>Quantum Computing Example</title>
    <published>2024-01-01T00:00:00Z</published>
    <updated>2024-01-01T00:00:00Z</updated>
    <link href='http://arxiv.org/abs/2401.00001'/>
    <link href='http://arxiv.org/pdf/2401.00001'/>
    <summary>Abstract content...</summary>
    <authors>
      <name>Author Name</name>
    </authors>
    <arxiv:primary_category xmlns:arxiv='http://arxiv.org/schemas/atom'>cs.AI</arxiv:primary_category>
    <arxiv:secondary_category xmlns:arxiv='http://arxiv.org/schemas/atom'>quant-ph</arxiv:secondary_category>
    <arxiv:comment_count>...</arxiv:comment_count>
  </entry>
</feed>
```

### JSON Response

Some endpoints support JSON output with compact array format. Useful for programmatic consumption but must still parse response text before JSON.parse to avoid NaN values (per AGENTS.md rules).

### RSS 2.0 Response

RSS format available for category feeds:
- `https://rss.arxiv.org/rss/{category}`

---

## 4. Paper Metadata Structure

### Per-Paper Metadata

| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Paper ID (e.g., `arXiv:2401.00001`) |
| `title` | String | Paper title |
| `summary` | String | Abstract/full text summary |
| `authors` | Array | List of author objects |
| `published` | DateTime | Publication date (ISO 8601) |
| `updated` | DateTime | Last update date |
| `abs_url` | URL | Abstract URL (`http://arxiv.org/abs/{id}`) |
| `pdf_url` | URL | PDF URL (`http://arxiv.org/pdf/{id}`) |
| `categories` | Array | Paper categories (primary + secondary) |
| `comments` | String | Comment field from paper |
| `journal_ref` | String | Journal reference if available |
| `submitted` | DateTime | Submission date |
| `tags` | Array | Tags if available |
| `versions` | Array | Version history |

### Author Structure

```json
{
  "name": "Author Name",
  "affiliation": "Institution Name",
  "email": "author@example.com"
}
```

### Category Structure

```json
{
  "termpaper": true,
  "subtype": "paper-type",
  "term": "category-name",
  "termpaper": false
}
```

---

## 5. MCP Tool Design

### Core Tools Mapping

#### Tool 1: `arxiv_search`
**Purpose**: Full-text search across ArXiv with filtering options

**Parameters**:
- `query` (string): Search query string
- `start` (integer, optional): Starting index (default: 0)
- `max_results` (integer, optional): Maximum results (default: 20, max: 2000)
- `sort_by` (string, optional): Sort field (`relevance`, `submittedDate`, `lastUpdatedDate`)
- `sort_order` (string, optional): Sort order (`ascending`, `descending`)
- `search_fields` (string, optional): Fields to search (`title`, `abstract`, `all`)
- `date_from` (string, optional): Start date for range filter
- `date_to` (string, optional): End date for range filter

**Output**: Array of papers with:
```json
[{
  "id": "arXiv:2401.00001",
  "title": "...",
  "summary": "...",
  "authors": [...],
  "published": "...",
  "abs_url": "http://arxiv.org/abs/2401.00001",
  "pdf_url": "http://arxiv.org/pdf/2401.00001"
}]
```

---

#### Tool 2: `arxiv_get_paper`
**Purpose**: Retrieve full metadata for a specific paper ID

**Parameters**:
- `id` (string, required): Paper ID (e.g., `2401.00001`)

**Output**: Full paper metadata with:
- Complete author list with affiliations
- All categories
- Comments, journal_ref, tags
- Version history
- `abs_url` and `pdf_url`

---

#### Tool 3: `arxiv_get_feed`
**Purpose**: Fetch papers from ArXiv RSS/Atom category feeds

**Parameters**:
- `category` (string, required): ArXiv category (e.g., `cs.CL`, `quant-ph`)
- `format` (string, optional): Response format (`rss`, `atom`) - default: `atom`
- `limit` (integer, optional): Maximum results
- `published_until` (string, optional): Filter by publish date up to

**Output**: Array of papers from the specified category feed

**ArXiv Categories (examples)**:
- Computer Science: `cs.AI`, `cs.CL`, `cs.CV`, `cs.CY`, `cs.CV`, `cs.LG`, etc.
- Physics: `astro-ph`, `cond-mat`, `hep-ph`, `nucl-th`, `quant-ph`
- Math: `math.AC`, `math.CO`, `math.PR`

---

#### Tool 4: `arxiv_get_pdf_url`
**Purpose**: Get PDF URL for a paper ID (canonical format)

**Parameters**:
- `id` (string, required): Paper ID

**Output**: Object with:
```json
{
  "abs_url": "http://arxiv.org/abs/2401.00001",
  "pdf_url": "http://arxiv.org/pdf/2401.00001"
}
```

**Purpose**: Enable agents to fetch both HTML abstracts and PDF content

---

#### Tool 5: `arxiv_related_papers`
**Purpose**: Get related papers via arXiv's related papers API

**Parameters**:
- `id` (string, required): Paper ID
- `start` (integer, optional)
- `max_results` (integer, optional)

**Output**: Array of related papers with `abs_url` and `pdf_url`

---

#### Tool 6: `arxiv_query_authors`
**Purpose**: Search for papers by author

**Parameters**:
- `author` (string, required): Author name
- `start`, `max_results`, `sort_by`, `sort_order` (optional)

**Output**: Papers by the specified author

---

## 6. Architecture Diagram

```mermaid
graph TB
    subgraph "User/Application"
        A[OpenCode/OpenSchema<br/>MCP Client]
    end
    
    subgraph "MCP Server Layer"
        B[src/index.ts<br/>Main Entry Point]
        C[arxiv_search]
        D[arxiv_get_paper]
        E[arxiv_get_feed]
        F[arxiv_get_pdf_url]
        G[arxiv_related_papers]
        H[arxiv_query_authors]
    end
    
    subgraph "ArXiv API Layer"
        I[http://export.arxiv.org/api/query]
        J[https://rss.arxiv.org/rss/{category}]
        K[https://rss.arxiv.org/atom/{category}]
    end
    
    A -->|stdio MCP Call| B
    B -->|parse args & call handler| C
    B -->|parse args & call handler| D
    B -->|parse args & call handler| E
    B -->|parse args & call handler| F
    B -->|parse args & call handler| G
    B -->|parse args & call handler| H
    
    C --> I
    D --> I
    E --> J
    E --> K
    F --> I
    G --> I
    H --> I
    
    I -.->|Atom 1.0 XML| L[XML Parser<br/>FastXML/cheerio]
    J -.->|RSS 2.0| L
    K -.->|Atom 1.0 XML| L
    
    L -->|parse XML| M[Normalize to JSON<br/>Extract abs_url & pdf_url]
    M -->|compacted JSON| B
```

---

## 7. Key Implementation Considerations

### HTTP Request Handling (per AGENTS.md)
1. Use **Axios** for all requests
2. **Parse response text before JSON.parse** to avoid NaN values
3. Handle HTTP errors naturally; throw them

### arXiv API URL Construction
```javascript
// Search endpoint
const searchUrl = 'http://export.arxiv.org/api/query';

// RSS/Atom feeds
const feedUrl = `https://rss.arxiv.org/rss/${category}`;
const atomFeedUrl = `https://rss.arxiv.org/atom/${category}`;
```

### XML Parsing Strategy
- Atom 1.0 XML is NOT JSON
- Must use proper XML parsers
- Extract `abs_url` and `pdf_url` from `<link>` elements
- Parse nested structures (entries → authors, categories)

### Response Canonicalization
**Always return both `abs_url` AND `pdf_url` together**:
```javascript
{
  "abs_url": "http://arxiv.org/abs/2401.00001",
  "pdf_url": "http://arxiv.org/pdf/2401.00001"
}
```

### Rate Limiting
- arXiv API does not document strict rate limits
- Recommend implementing client-side throttling
- Throttle requests if similar to other OpenCode configurations

### Error Handling
```javascript
try {
  const response = await axios.get(url, {
    params: { search_query: query, output: 'json' }
  });
  const data = JSON.parse(response.data.text); // Parse text, not directly
} catch (error) {
  throw new ArXivAPIError(`Failed to fetch: ${error.message}`);
}
```

---

## 8. Testing Strategy

Per AGENTS.md:
- Tests run from project root with `npx vitest`
- Mock ArXiv API responses for unit tests
- Integration tests against real ArXiv API with timeout handling

---

## 9. Configuration

Per AGENTS.md:
- **OpenCode MCP**: Configure in `opencode.json`
- Type: `"local"`
- Command: Array format
- Throttle requests if applicable

---

## 10. Deliverables Summary

| File | Purpose |
|------|---------|
| `arxiv-api-analysis.md` | This comprehensive analysis document |
| `src/index.ts` | Main MCP server entry point |
| `src/tools/arxiv_search.ts` | Search tool implementation |
| `src/tools/arxiv_get_paper.ts` | Paper retrieval tool |
| `src/tools/arxiv_get_feed.ts` | RSS/Atom feed tool |
| `src/tools/arxiv_get_pdf_url.ts` | PDF URL tool |
| `src/tools/arxiv_related_papers.ts` | Related papers tool |
| `src/tools/arxiv_query_authors.ts` | Author search tool |
| `opencode.json` | OpenCode MCP configuration |

---

## 11. Next Steps

1. [ ] Implement `src/index.ts` - Main entry point with stdio MCP protocol
2. [ ] Implement `arxiv_search` tool with full query parameter support
3. [ ] Implement `arxiv_get_paper` tool for full paper metadata
4. [ ] Implement `arxiv_get_feed` tool for RSS/Atom feeds
5. [ ] Implement `arxiv_get_pdf_url` tool for canonical URLs
6. [ ] Implement `arxiv_related_papers` tool
7. [ ] Implement `arxiv_query_authors` tool
8. [ ] Add XML parsing utilities with proper Atom 1.0 support
9. [ ] Add error handling and rate limiting
10. [ ] Write unit and integration tests with Vitest
11. [ ] Add configuration to `opencode.json`
12. [ ] Document CLI usage and examples

---

## Appendix A: ArXiv Category Taxonomy

### Complete Category List

| Prefix | Domain |
|--------|--------|
| `astro-ph` | Astrophysics |
| `cs` | Computer Science (subcategories: AI, CL, CV, CY, DB, DM, GC, GT, IR, LG, MM, NE, NI, NL, PL, RO, SG, SD etc.) |
| `cond-mat` | Condensed Matter |
| `cs` | Computer Science |
| `eess` | Engineering - Electronics |
| `math` | Mathematics |
| `nucl-th` | Nuclear Theory |
| `physics` | Physics (general) |
| `quant-ph` | Quantum Physics |
| `q-bio` | Quantitative Biology |
| `q-fin` | Quantitative Finance |
| `math-ph` | Mathematical Physics |
| `nlin` | Nonlinear Science |
| `hep` | High Energy Physics subcategories |

---

## Appendix B: Query Syntax Examples

### Basic Search
```
title:quantum OR abstract:transputer
```

### Date Range
```
submitted: 2024
```

### Category Filter (implicit in document search)
```
cat:cs.AI servedoc:true abstract:neural
```

### Author Search
```
all: (SMITH John* OR SMITH JL) submitted: 2023
```

---

## Appendix C: XML Structure Reference

### Atom Feed Structure
```xml
<feed>
  <title/>
  <id/>
  <updated/>
  <opensearch:totalResults>1000</opensearch:totalResults>
  
  <entry>
    <id>arXiv:2401.00001</id>
    <title/>
    <published />
    <updated />
    <link rel="alternate" type="text/html"/>
    <link rel="related" type="application/pdf"/>
    <summary/>
    <content type="html"/>
    <author><name/> <affiliation/> <email/></author>
    <arxiv:primary_category />
    <arxiv:secondary_category />
    <arxiv:topic_closed />
    <arxiv:comment_count />
  </entry>
</feed>
```

---

*This analysis document provides the foundation for implementing the MCP ArXiv server according to the project architecture rules.*
