/**
 * ArXiv API Constants
 * Source: https://info.arxiv.org/help/find/index.html
 * https://info.arxiv.org/help/view.html
 */

// ArXiv API endpoint
export const ARXIV_SEARCH_URL = 'http://export.arxiv.org/api/query';

// RSS/Atom feed URLs by category
export const RSS_FEED_BASE = 'https://rss.arxiv.org/rss';
export const ATOM_FEED_BASE = 'https://rss.arxiv.org/atom';

// ISO file format (preferred response format for Atom 1.0)
export const ISO_FORMAT = 'ISO';

// Default pagination
export const DEFAULT_START = 1;
export const DEFAULT_MAX_RESULTS = 10;
export const MAX_MAX_RESULTS = 20;

// Sorting options
export const SORT_OPTIONS = {
  TIMESTAMP: 'timestamp',
  RELEVANCE: 'relevance'
};

// Sort order
export const SORT_ORDER = {
  DESCENDING: 'descending',
  ASCENDING: 'ascending'
};

// Searchable fields
export const SEARCH_FIELDS = {
  ALL_TEXT: 'all_text',
  NON_HUMAN: 'nonhuman',
  TITLES: 'titles',
  ABSTRACTS: 'abstracts',
  AUTHOR: 'author',
  TITLE: 'title',
  ABSTRACT: 'abstract',
  FIRST_AUTHOR: 'first_author',
  ALL_AUTHORS: 'all_authors',
  CATEGORY: 'category',
  PRIMARY_CATEGORY: 'primary_category',
  SUBJECT: 'subject',
  KEYWORDS: 'keywords',
  COMMENTS: 'comments',
  JOURNALS: 'journals',
  REPORTS: 'reports'
};

// Date range options (qualifiers)
export const DATE_QUALIFIERS = {
  PAST_7_DAYS: 'pastweek',
  LAST_3_MONTHS: 'pastmonth',
  PAST_YEAR: 'pastyear'
};

// All ArXiv category codes
export const CATEGORY_CODES = [
  // Computer Science (cs.XX)
  'cs.AI', 'cs.CL', 'cs.CV', 'cs.CR', 'cs.CY', 'cs.DB', 'cs.DC',
  'cs.DL', 'cs.DM', 'cs.DS', 'cs.FL', 'cs.GI', 'cs.GL', 'cs.GR', 'cs.GT',
  'cs.II', 'cs.IT', 'cs.KP', 'cs.LG', 'cs.LO', 'cs.MA',
  'cs.MS', 'cs.MM', 'cs.NA', 'cs.NE', 'cs.NI', 'cs.OH', 'cs.OS', 'cs.PF',
  'cs.PL', 'cs.PR', 'cs.QC', 'cs.RI', 'cs.RO', 'cs.RT', 'cs.SE', 'cs.SI',
  'cs.SY', 'cs.TC',
  // Physics
  'quant-ph', 'hep-th', 'hep-ex', 'hep-ph', 'hep-lat', 'hep-ra',
  'nu-th', 'nu-ex', 'astro-ph', 'astro-ph.CO', 'astro-ph.GA', 'astro-ph.EP',
  'astro-ph.IM', 'math-ph', 'chaos', 'cond-mat', 'cond-mat.mes-hall',
  'cond-mat.mtrl-sci', 'cond-mat.str-el', 'cond-mat.quant-gas',
  'cond-mat.supr-con', 'cond-mat.dis-nn', 'cond-mat.stat-mech',
  'cond-mat.soft', 'cond-mat.other',
  // Others
  'nucl-th', 'nucl-ex'
];
