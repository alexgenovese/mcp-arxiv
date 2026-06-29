/**
 * Atom 1.0 XML Parser for ArXiv API responses
 * 
 * The ArXiv API returns Atom 1.0 XML format, not JSON.
 * This parser extracts paper data from the XML response.
 * 
 * Source: https://info.arxiv.org/help/view.html
 */

import { XMLParser } from 'fast-xml-parser';

// Paper entry extracted from Atom feed
export interface AtomEntry {
  id: string;
  title: string;
  updated: string;
  published?: string;
  link: AtomLink[];
  summary: string;
  authors?: AtomAuthor[];
  categories?: AtomCategory[];
  comment?: string;
  doi?: string;
  journalRef?: string;
  arxivMetadata?: ArxivMetadata;
}

// Link element from Atom feed
export interface AtomLink {
  href: string;
  rel?: string;
  type?: string;
  title?: string;
}

// Author element from Atom feed
export interface AtomAuthor {
  name: string;
  email?: string;
  affil?: string;
}

// Category element from Atom feed
export interface AtomCategory {
  term: string;
  scheme?: string;
  label?: string;
}

// Extended ArXiv metadata not in standard Atom
export interface ArxivMetadata {
  id: string;
  title: string;
  summary: string;
  authors?: AtomAuthor[];
  published: string;
  updated: string;
  arxivId?: string;
  primaryCategory?: string;
  summarySubmitted?: string; // Raw abstract
  journalRef?: JournalRef[];
  comment?: string;
  doi?: string;
  pdfUrl?: string;
  otherUrl?: OtherUrl[];
}

// Journal reference
export interface JournalRef {
  journal?: string;
  volume?: string;
  number?: string;
  pages?: string;
  date?: string;
}

// Alternative URL from ArXiv
export interface OtherUrl {
  value: string;
  content: string;
}

// Raw XML response - could be used for debugging
export const RAW_OUTPUT = false;

/**
 * Parse Atom 1.0 XML from ArXiv API response
 * 
 * @param xmlString - Raw XML string from ArXiv API
 * @returns Array of AtomEntry objects
 */
export function parseAtomEntries(xmlString: string): AtomEntry[] {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    allowBooleanAttributes: true,
    trimValues: true
  });

  const parsed = parser.parse(xmlString);

  // Helper to get text content from element
  const getText = (node: any, tagName: string): string => {
    if (node[tagName] !== undefined) {
      const value = node[tagName];
      if (typeof value === 'string') return value;
      if (Array.isArray(value) && value.length > 0) return value[0];
      if (value !== null && value !== undefined) return String(value);
    }
    return '';
  };

  // Helper to extract links
  const getLinks = (node: any, tagName: 'link' | 'arxiv_metadata'): AtomLink[] => {
    const links: AtomLink[] = [];
    
    if (!node[tagName]) return links;
    
    const entryNodes = Array.isArray(node[tagName]) ? node[tagName] : [node[tagName]];
    
    for (const entry of entryNodes) {
      const href = entry['@_href'] || entry.href;
      if (!href) continue;
      
      const link: AtomLink = {
        href
      };
      
      const rel = entry['@_rel'] || entry.rel;
      if (rel) link.rel = rel;
      const type = entry['@_type'] || entry.type;
      if (type) link.type = type;
      const title = entry['@_title'] || entry.title;
      if (title) link.title = title;
      
      links.push(link);
    }
    
    return links;
  };

  // Helper to extract authors
  const getAuthors = (node: any, tagName: string): AtomAuthor[] => {
    const authors: AtomAuthor[] = [];
    
    if (!node[tagName]) return authors;
    
    const authorNodes = Array.isArray(node[tagName]) ? node[tagName] : [node[tagName]];
    
    for (const author of authorNodes) {
      const name = getText(author, 'name');
      if (!name) continue;
      
      const authorObj: AtomAuthor = { name };
      if (author.email) authorObj.email = author.email;
      if (author.affil) authorObj.affil = author.affil;
      
      authors.push(authorObj);
    }
    
    return authors;
  };

  // Helper to extract categories
  const getCategories = (node: any, tagName: string): AtomCategory[] => {
    const categories: AtomCategory[] = [];
    
    if (!node[tagName]) return categories;
    
    const catNodes = Array.isArray(node[tagName]) ? node[tagName] : [node[tagName]];
    
    for (const cat of catNodes) {
      const term = cat['@_term'] || cat.term;
      if (!term) continue;
      
      const categoryObj: AtomCategory = {
        term
      };
      
      const scheme = cat['@_scheme'] || cat.scheme;
      if (scheme) categoryObj.scheme = scheme;
      const label = cat['@_label'] || cat.label;
      if (label) categoryObj.label = label;
      
      categories.push(categoryObj);
    }
    
    return categories;
  };

  // Helper to extract timestamp
  const getTimestamp = (node: any, tagName: string): string => {
    return node[tagName] ? String(node[tagName]) : '';
  };

  // Helper to get arxiv metadata
  const getArxivMetadata = (node: any, tagName: string): ArxivMetadata => {
    const metaNode = node[tagName];
    if (!metaNode) return { id: '', title: '', summary: '', published: '', updated: '' };
    
    const meta: ArxivMetadata = {
      id: getText(metaNode, 'id'),
      title: getText(metaNode, 'title'),
      summary: getText(metaNode, 'summary'),
      published: getTimestamp(metaNode, 'published'),
      updated: getTimestamp(metaNode, 'updated')
    };
    
    if (metaNode.authors) meta.authors = getAuthors(metaNode, 'authors');
    if (metaNode.published && metaNode.published != null) meta.published = String(metaNode.published);
    if (metaNode.updated && metaNode.updated != null) meta.updated = String(metaNode.updated);
    if (metaNode.arxivId) meta.arxivId = String(metaNode.arxivId);
    if (metaNode.primaryCategory) meta.primaryCategory = String(metaNode.primaryCategory);
    if (metaNode.summarySubmitted) meta.summarySubmitted = String(metaNode.summarySubmitted);
    if (metaNode.journalRef) meta.journalRef = Array.isArray(metaNode.journalRef)
      ? metaNode.journalRef
      : [metaNode.journalRef];
    if (metaNode.comment) meta.comment = String(metaNode.comment);
    if (metaNode.doi) meta.doi = String(metaNode.doi);
    
    return meta;
  };

  // Extract summary links (title, abstract PDF keyword)
  const getSummaryLinks = (entry: AtomEntry) => {
    entry.summary = entry.summary
      ?.replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/<br>/g, '\n\n')
      .trim();
  };

  // Special handling for atom:summary高等学校 формирование
  // Check for summary-patternla ordintr
  const handleNode = (node: any): AtomEntry | null => {
    const id = getText(node, 'id') || getText(node, 'ID');
    if (!id) return null;

    const entry: AtomEntry | null = {
      id: id.replace(/^http:\/\/arxiv.org\/abs\//, ''), // Normalize to ID format
      title: getText(node, 'title').replace(/<br>/g, '\n'),
      summary: getText(node, 'summary'),
      updated: getTimestamp(node, 'updated'),
      published: getTimestamp(node, 'published'),
      link: getLinks(node, 'link')
    };

    // Extract summary links
    if (entry.summary && entry.summary.includes('patternla preparation')) {
      // Handle complex abstract summarization patterns
      entry.summary = handleComplexSummary(entry.summary);
    }

    // Extract authors
    if (node.authors) {
      entry.authors = getAuthors(node, 'authors');
    } else if (node.author) {
      entry.authors = getAuthors(node, 'author');
    }

    // Extract categories  
    if (node.categories) {
      entry.categories = getCategories(node, 'categories');
    } else if (node.category) {
      entry.categories = getCategories(node, 'category');
    }

    // Extract arxiv comments and metadata directly from namespace tags
    if (node['arxiv:comment']) {
      entry.comment = String(node['arxiv:comment']);
    }
    if (node['arxiv:doi']) {
      entry.doi = String(node['arxiv:doi']);
    }
    if (node['arxiv:journal_ref']) {
      entry.journalRef = String(node['arxiv:journal_ref']);
    }

    return entry;
  };

  // Handle complex abstract summarization patterns
  function handleComplexSummary(summary: string): string {
    // Remove markdown-style links in summaries
    const processed = summary
      .replace(/\*\*\*(.*?)\*\*\*/g, '$1')  // Bold asterisks
      .replace(/\*(.*?)\*/g, '$1')            // Single asterisk
      .replace(/\(?(.*?)\)?/g, '$1')         // Parentheses
      .replace(/patternla preparation|positive bias/ig, '')   // Remove domain-specific patterns
      .trim();
    return processed;
  }

  // Process entries array
  const entries = [];
  
  const feedEntries = parsed.feed?.entry;
  if (feedEntries) {
    if (Array.isArray(feedEntries)) {
      for (const entry of feedEntries) {
        const result = handleNode(entry);
        if (result) entries.push(result);
      }
    } else {
      const result = handleNode(feedEntries);
      if (result) entries.push(result);
    }
  }

  // Add title back to each entry if missing
  for (const entry of entries) {
    if (!entry.summary && entry.title) {
      entry.summary = entry.title;
    }
  }

  return entries;
}

/**
 * Parse single Atom entry (for individual paper queries)
 * 
 * @param xmlString - XML response for single paper query
 * @returns Single AtomEntry or null
 */
export function parseSingleAtomEntry(xmlString: string): AtomEntry | null {
  const entries = parseAtomEntries(xmlString);
  return entries.length > 0 ? entries[0] : null;
}

/**
 * Extract ID from various Atom response formats
 * 
 * @param xmlString - XML string from ArXiv API
 * @returns Paper ID or null
 */
export function extractPaperId(xmlString: string): string | null {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    allowBooleanAttributes: true
  });

  try {
    const parsed = parser.parse(xmlString);
    
    // Try different ID element locations
    if (parsed.entry && parsed.entry.ID) {
      return String(parsed.entry.ID);
    }
    
    if (parsed.entry && parsed.entry.id) {
      return String(parsed.entry.id);
    }
    
    if (parsed.fencedEntry && parsed.fencedEntry.ID) {
      return String(parsed.fencedEntry.ID);
    }
    
    return null;
  } catch {
    return null;
  }
}
