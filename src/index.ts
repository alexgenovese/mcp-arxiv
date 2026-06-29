/**
 * Main MCP Server Entry Point
 * ArXiv API MCP Server - enables AI assistants to interact with arXiv
 * 
 * Protocol: stdio (as specified in AGENTS.md)
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequest, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

import {
  fetchFromArXiv,
  fetchPaperById
} from './api_client.js';

import {
  parseAtomEntries,
  parseSingleAtomEntry,
  extractPaperId
} from './xml_parser.js';

// Re-export parser utilities
export { parseAtomEntries, parseSingleAtomEntry, extractPaperId };
export * from './utils/constants.js';

/**
 * Paper result interface - normalized output from all tools
 * Per AGENTS.md: Always include both abs_url AND pdf_url
 */
export interface PaperResult {
  id: string;
  title: string;
  summary: string;
  abs_url: string;
  pdf_url: string;
  html_url?: string;
  published?: string;
  updated?: string;
  authors?: PaperAuthor[];
  categories?: string[];
  doi?: string;
  journal_ref?: string;
  comment?: string;
  abstract_html?: string;
}

/**
 * Author info for paper metadata
 */
export interface PaperAuthor {
  name: string;
  email?: string;
  affil?: string;
}

/**
 * Parse Atom XML from ArXiv response
 * Extracts paper entries with all metadata
 */
function parseArxivSearchResults(xmlResponse: string): PaperResult[] {
  const entries = parseAtomEntries(xmlResponse);
  const results: PaperResult[] = [];

  for (const entry of entries) {
    const paperId = entry.id || '';
    
    // Get links from entry
    let absUrl = '';
    let pdfUrl = '';

    for (const link of entry.link) {
      if (link.rel === 'alternate') absUrl = link.href;
      if (link.rel === 'enclosure' || (link.rel === 'related' && link.title === 'pdf') || link.href.includes('=pdf')) {
        pdfUrl = link.href;
      }
    }

    // Build canonical URLs if missing
    const absUrlBase = absUrl || `https://arxiv.org/abs/${paperId}`;
    const pdfUrlBase = pdfUrl || `https://arxiv.org/pdf/${paperId}.pdf`;
    const htmlUrlBase = `https://arxiv.org/html/${paperId}`;

    results.push({
      id: paperId,
      title: entry.title || 'No title',
      summary: entry.summary || '',
      abs_url: absUrlBase,
      pdf_url: pdfUrlBase,
      html_url: htmlUrlBase,
      published: entry.published,
      updated: entry.updated,
      authors: entry.authors || [],
      categories: entry.categories?.filter(c => c?.term).map(c => c.term) || [],
      doi: entry.doi,
      comment: entry.comment,
      journal_ref: entry.journalRef
    });
  }

  return results;
}

/**
 * Tool handler: arxiv_search
 * Search ArXiv for papers matching the query text
 */
async function arxivSearch(params: any): Promise<CallToolResult> {
  try {
    const query = params.query;
    if (!query) {
      return {
        content: [{ type: 'text', text: 'Error: query parameter is required' }] as any,
        isError: true
      };
    }

    const start = params.start || 1;
    const maxResults = Math.min(params.max_results || 10, 20);
    const sortBy = params.sort_by || 'timestamp';
    const sortOrder = params.sort_order || 'descending';
    const searchField = params.search_field || 'all_text';
    const category = params.category;

    const xmlResponse = await fetchFromArXiv({
      search_query: query,
      start,
      max_results: maxResults,
      sort_by: sortBy,
      sort_order: sortOrder,
      search_field: searchField,
      category: category
    });

    const results = parseArxivSearchResults(xmlResponse);

    return {
      content: [
        { type: 'text' as const, text: `Found ${results.length} papers` },
        ...results.map(r => ({
          type: 'text' as const,
          text: JSON.stringify({
            id: r.id,
            title: r.title,
            summary: r.summary.substring(0, 200) + (r.summary.length > 200 ? '...' : ''),
            abs_url: r.abs_url,
            pdf_url: r.pdf_url,
            html_url: r.html_url,
            published: r.published,
            authors: r.authors?.map(a => a.name),
            categories: r.categories,
            comment: r.comment,
            doi: r.doi,
            journal_ref: r.journal_ref
          }, null, 2)
        }))
      ],
      isStructured: true,
      structuredContent: {
        type: 'array',
        value: results.map(r => ({
          id: r.id,
          title: r.title,
          summary: r.summary,
          abs_url: r.abs_url,
          pdf_url: r.pdf_url,
          html_url: r.html_url,
          published: r.published,
          authors: r.authors,
          categories: r.categories,
          comment: r.comment,
          doi: r.doi,
          journal_ref: r.journal_ref
        }))
      }
    };
  } catch (error) {
    return {
      content: [{ type: 'text' as const, text: `Search failed: ${(error as Error).message}` }],
      isError: true
    };
  }
}

/**
 * Tool handler: arxiv_get_paper
 * Get full metadata for a specific arXiv paper by ID
 */
async function arxivGetPaper(params: any): Promise<CallToolResult> {
  try {
    const paperId = params.paper_id;
    if (!paperId) {
      return {
        content: [{ type: 'text' as const, text: 'Error: paper_id parameter is required' }],
        isError: true
      };
    }

    const xmlResponse = await fetchFromArXiv({
      search_query: paperId
    });

    const entry = parseSingleAtomEntry(xmlResponse);
    
    if (!entry || !entry.id) {
      return {
        content: [{ type: 'text' as const, text: `Error: Paper ${paperId} not found` }],
        isError: true
      };
    }

    const normalizedId = entry.id.replace(/^http:\/\/arxiv.org\/abs\//, '');
    const absUrl = `https://arxiv.org/abs/${normalizedId}`;
    const pdfUrl = `https://arxiv.org/pdf/${normalizedId}.pdf`;
    const htmlUrl = `https://arxiv.org/html/${normalizedId}`;

    return {
      content: [
        { type: 'text' as const, text: `Retrieved paper: ${entry.title}` },
        { type: 'text' as const, text: JSON.stringify({
          id: normalizedId,
          title: entry.title,
          summary: entry.summary || '',
          abs_url: absUrl,
          pdf_url: pdfUrl,
          html_url: htmlUrl,
          published: entry.published,
          updated: entry.updated,
          authors: entry.authors,
          categories: entry.categories?.filter(c => c?.term).map(c => c.term) || [],
          comment: entry.comment,
          doi: entry.doi,
          journal_ref: entry.journalRef
        }, null, 2) }
      ],
      isStructured: true,
      structuredContent: {
        type: 'object',
        value: {
          id: normalizedId,
          title: entry.title,
          summary: entry.summary,
          abs_url: absUrl,
          pdf_url: pdfUrl,
          html_url: htmlUrl,
          published: entry.published,
          updated: entry.updated,
          authors: entry.authors,
          categories: entry.categories?.filter(c => c?.term).map(c => c.term) || [],
          comment: entry.comment,
          doi: entry.doi,
          journal_ref: entry.journalRef
        }
      }
    };
  } catch (error) {
    return {
      content: [{ type: 'text' as const, text: `Failed to get paper: ${(error as Error).message}` }],
      isError: true
    };
  }
}

/**
 * Tool handler: arxiv_get_pdf_url
 * Get the canonical absolute and PDF URLs for a paper
 */
async function arxivGetPdfUrl(params: any): Promise<CallToolResult> {
  try {
    const paperId = params.paper_id;
    if (!paperId) {
      return {
        content: [{ type: 'text' as const, text: 'Error: paper_id parameter is required' }],
        isError: true
      };
    }

    return {
      content: [
        { type: 'text' as const, text: `URLs for paper ${paperId}` },
        { type: 'text' as const, text: JSON.stringify({
          id: paperId,
          abs_url: `https://arxiv.org/abs/${paperId}`,
          pdf_url: `https://arxiv.org/pdf/${paperId}.pdf`,
          html_url: `https://arxiv.org/html/${paperId}`
        }, null, 2) }
      ],
      isStructured: true,
      structuredContent: {
        type: 'object',
        value: {
          id: paperId,
          abs_url: `https://arxiv.org/abs/${paperId}`,
          pdf_url: `https://arxiv.org/pdf/${paperId}.pdf`,
          html_url: `https://arxiv.org/html/${paperId}`
        }
      }
    };
  } catch (error) {
    return {
      content: [{ type: 'text' as const, text: `Failed to get PDF URL: ${(error as Error).message}` }],
      isError: true
    };
  }
}

/**
 * Tool handler: arxiv_related_papers
 * Get related papers for a given paper ID
 */
async function arxivRelatedPapers(params: any): Promise<CallToolResult> {
  try {
    const paperId = params.paper_id;
    if (!paperId) {
      return {
        content: [{ type: 'text' as const, text: 'Error: paper_id parameter is required' }],
        isError: true
      };
    }

    // Fetch paper to get topic keywords for related search
    const xmlResponse = await fetchFromArXiv({
      search_query: paperId
    });
    const entry = parseSingleAtomEntry(xmlResponse);
    
    if (!entry) {
      return {
        content: [{ type: 'text' as const, text: `Error: Paper ${paperId} not found` }],
        isError: true
      };
    }

    return {
      content: [
        { type: 'text' as const, text: `No dedicated related papers API. Use arxiv_search with topic keywords from this paper's title or abstract.` }
      ],
      isStructured: true,
      structuredContent: {
        type: 'object',
        value: {
          paper_id: paperId,
          title: entry.title,
          suggestion: 'Use arxiv_search with keywords from the paper abstract or title'
        }
      }
    };
  } catch (error) {
    return {
      content: [{ type: 'text' as const, text: `Failed to get related papers: ${(error as Error).message}` }],
      isError: true
    };
  }
}

/**
 * Tool handler: arxiv_query_authors
 * Query papers by author name
 */
async function arxivQueryAuthors(params: any): Promise<CallToolResult> {
  try {
    const authorName = params.author;
    if (!authorName) {
      return {
        content: [{ type: 'text' as const, text: 'Error: author parameter is required' }],
        isError: true
      };
    }

    const maxResults = Math.min(params.max_results || 10, 20);

    // Search by author field - note: ArXiv uses '-' prefix for exact author matching
    const xmlResponse = await fetchFromArXiv({
      search_query: '-(title:' + authorName + ' OR abstract:' + authorName + ')',
      search_field: 'all_text'
    });

    const results = parseArxivSearchResults(xmlResponse);

    return {
      content: [
        { type: 'text' as const, text: `Found ${results.length} papers related to author "${authorName}"` },
        ...results.map(r => ({
          type: 'text' as const,
          text: JSON.stringify({
            id: r.id,
            title: r.title,
            authors: r.authors?.map(a => a.name),
            abs_url: r.abs_url
          }, null, 2)
        }))
      ],
      isStructured: true,
      structuredContent: {
        type: 'array',
        value: results.map(r => ({
          id: r.id,
          title: r.title,
          authors: r.authors,
          abs_url: r.abs_url
        }))
      }
    };
  } catch (error) {
    return {
      content: [{ type: 'text' as const, text: `Failed to query authors: ${(error as Error).message}` }],
      isError: true
    };
  }
}

/**
 * Tool handler: arxiv_get_feed
 * Get papers from an arXiv RSS/Atom feed by category
 */
async function arxivGetFeed(params: any): Promise<CallToolResult> {
  try {
    const category = params.category;
    if (!category) {
      return {
        content: [{ type: 'text' as const, text: 'Error: category parameter is required' }],
        isError: true
      };
    }

    const maxResults = Math.min(params.max_results || 10, 20);

    const xmlResponse = await fetchFromArXiv({
      search_query: `category:${category}`,
      max_results: maxResults
    });

    const results = parseArxivSearchResults(xmlResponse);

    return {
      content: [
        { type: 'text' as const, text: `Found ${results.length} papers in category ${category}` },
        ...results.map(r => ({
          type: 'text' as const,
          text: JSON.stringify({
            id: r.id,
            title: r.title,
            categories: r.categories,
            abs_url: r.abs_url
          }, null, 2)
        }))
      ],
      isStructured: true,
      structuredContent: {
        type: 'array',
        value: results.map(r => ({
          id: r.id,
          title: r.title,
          categories: r.categories,
          abs_url: r.abs_url
        }))
      }
    };
  } catch (error) {
    return {
      content: [{ type: 'text' as const, text: `Failed to get feed: ${(error as Error).message}` }],
      isError: true
    };
  }
}

/**
 * Register all tools with the MCP server
 */
function registerTools(server: McpServer): void {
  server.registerTool(
    'arxiv_search',
    {
      description: 'Search arXiv for papers matching the query text',
      inputSchema: {
        query: z.string().describe('The search query string'),
        start: z.number().optional().describe('Offset for pagination (default: 1)'),
        max_results: z.number().optional().describe('Maximum number of results (default: 10, max: 20)'),
        sort_by: z.enum(['submittedDate', 'lastUpdatedDate', 'relevance', 'timestamp']).optional().describe('Sort by field (default: submittedDate)'),
        sort_order: z.enum(['descending', 'ascending']).optional().describe('Sort order (default: descending)'),
        search_field: z.enum(['all_text', 'titles', 'abstracts', 'author']).optional().describe('Field to search in'),
        date_from: z.string().optional().describe('Start date for date range filter (ISO format)'),
        date_to: z.string().optional().describe('End date for date range filter (ISO format)'),
        category: z.string().optional().describe('Restrict to a specific category (e.g., cs.LG, quant-ph)')
      }
    },
    arxivSearch
  );

  server.registerTool(
    'arxiv_get_paper',
    {
      description: 'Get full metadata for a specific arXiv paper by ID',
      inputSchema: {
        paper_id: z.string().describe('The arXiv paper ID (e.g., 2401.12345)')
      }
    },
    arxivGetPaper
  );

  server.registerTool(
    'arxiv_get_pdf_url',
    {
      description: 'Get the canonical absolute and PDF URLs for a paper',
      inputSchema: {
        paper_id: z.string().describe('The arXiv paper ID (e.g., 2401.12345)')
      }
    },
    arxivGetPdfUrl
  );

  server.registerTool(
    'arxiv_related_papers',
    {
      description: 'Get related papers for a given paper ID',
      inputSchema: {
        paper_id: z.string().describe('The arXiv paper ID'),
        max_results: z.number().optional().describe('Maximum related papers to return')
      }
    },
    arxivRelatedPapers
  );

  server.registerTool(
    'arxiv_query_authors',
    {
      description: 'Query papers by author name',
      inputSchema: {
        author: z.string().describe('Author name to search for'),
        max_results: z.number().optional().describe('Maximum results to return')
      }
    },
    arxivQueryAuthors
  );

  server.registerTool(
    'arxiv_get_feed',
    {
      description: 'Get papers from an arXiv RSS/Atom feed by category',
      inputSchema: {
        category: z.string().describe('ArXiv category code (e.g., cs.LG, quant-ph)'),
        format: z.enum(['atom', 'rss']).optional().describe('Feed format (atom or rss, default: atom)'),
        max_results: z.number().optional().describe('Maximum papers to return'),
        published_until: z.string().optional().describe('Filter papers published before this date (ISO format)')
      }
    },
    arxivGetFeed
  );
}

// Main server setup
const server = new McpServer({
  name: 'arxiv-api',
  version: '1.0.0'
},
{
  capabilities: {
    tools: {}
  }
});

registerTools(server);

// Type declarations
declare const process: {
  cwd: () => string;
  env: any;
  exit: (code?: number) => void;
};

declare namespace NodeJS {
  interface Global {
    console: any;
  }
}

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error('Server initialization failed:', error);
  process.exit(1);
});
