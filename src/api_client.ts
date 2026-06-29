/**
 * ArXiv API HTTP Client
 * 
 * Handles HTTP requests to the ArXiv API endpoints.
 * 
 * Source: https://info.arxiv.org/help/find/index.html
 */

import axios, { AxiosError, AxiosRequestConfig } from 'axios';

// Node types must be defined manually since we can't import from node
declare const setTimeout: (fn: (...args: any[]) => void, ms: number) => NodeJS.Timeout;

/**
 * ArXivSearchRequestParams
 * Parameters for the ArXiv search API
 * Source: https://info.arxiv.org/help/find.html
 */
export interface ArXivSearchParams {
  // Search query
  search_query?: string;
  
  // Date range: restrict the search to a particular time range
  date_from?: string;
  date_to?: string;
  
  // ID range
  id_gte?: string;
  id_lte?: string;
  
  // Maximum number of results. Maximum value is 200.
  max_results?: number;
  
  // Start offset (for pagination)
  start?: number;
  
  // Search methods - default is all_text
  search_method?: 'alltextquery' | 'anywordquery' | 'exactquery';
  
  // Search within specific fields
  search_field?: 'all_text' | 'titles' | 'abstracts' | 'author';
  
  // Sorting: recency of publication
  sort_by?: 'timestamp';
  sort_order?: 'descending' | 'ascending';
  
  // Content type (XML response format)
  output_format?: 'atom';
  
  // Categories: restrict results to a single category
  category?: string;
  
  // Comment type filter  
  comentype?: string;
  
  // Limit parameter
  limit?: number;
  
  // Qualifiers for date ranges
  qualifiers?: Array<'pastweek' | 'pastmonth' | 'pastyear'>;
  
  // Matching options
  enable_nonhuman?: 'false';
}

/**
 * Create an Axios config for the ArXiv API request
 */
function createAxiosConfig(params?: ArXivSearchParams): AxiosRequestConfig<any> {
  const baseURL = 'http://export.arxiv.org/api/query';
  
  const config: AxiosRequestConfig<any> = {
    baseURL,
    method: 'GET',
    timeout: 30000, // 30 second timeout
    maxRedirects: 5,
    headers: {
      'Accept': 'application/atom+xml',
      'User-Agent': 'mcp-arxiv/1.0.0',
      'Accept-Encoding': 'gzip, deflate'
    } as any,
    params: {}
  };
  
  // Build query parameters
  if (params?.search_query) {
    config.params.search_query = params.search_query;
  }
  if (params?.date_from) {
    config.params.date_from = params.date_from;
  }
  if (params?.date_to) {
    config.params.date_to = params.date_to;
  }
  if (params?.max_results) {
    config.params.max_results = params.max_results;
  }
  if (params?.start !== undefined) {
    config.params.start = params.start;
  }
  if (params?.search_method) {
    config.params.search_method = params.search_method;
  }
  if (params?.search_field) {
    config.params.search_field = params.search_field;
  }
  if (params?.sort_by) {
    config.params.sort_by = params.sort_by;
  }
  if (params?.sort_order) {
    config.params.sort_order = params.sort_order;
  }
  if (params?.output_format) {
    config.params.output_format = params.output_format;
  }
  if (params?.category) {
    config.params.category = params.category;
  }
  if (params?.comentype) {
    config.params.comentype = params.comentype;
  }
  if (params?.limit) {
    config.params.limit = params.limit;
  }
  if (params?.qualifiers) {
    config.params.qualifiers = params.qualifiers.join(',');
  }
  if (params?.enable_nonhuman !== undefined) {
    config.params.enable_nonhuman = params.enable_nonhuman;
  }
  
  return config;
}

/**
 * Fetch data from ArXiv API
 * 
 * @param params - Search/query parameters
 * @returns Promise with response text (XML)
 */
export async function fetchFromArXiv(
  params: ArXivSearchParams = {}
): Promise<string> {
  // Rate limiting
  await sleep(100);
  
  try {
    const config = createAxiosConfig(params);
    const response = await axios(config);
    
    if (response.status >= 300) {
      throw new Error(`ArXiv API error: ${response.status} ${response.statusText}`);
    }
    
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<any>;
    
    if (axiosError && axiosError.response?.status) {
      if (axiosError.response.status === 429) {
        throw new Error('Rate limit exceeded. Please wait before making more requests.');
      }
      if (axiosError.response.status === 404) {
        throw new Error('Not found. Please check your search parameters.');
      }
    }
    
    throw new Error(`Failed to fetch from ArXiv API: ${axiosError?.message}`);
  }
}

/**
 * Fetch a single ArXiv paper by ID
 * 
 * @param paperId - arXiv paper ID (e.g., "2401.12345")
 * @returns Promise with Atom XML response for the paper
 */
export async function fetchPaperById(paperId: string): Promise<string> {
  const url = `https://arxiv.org/eprint/abs/${paperId}`;
  
  await sleep(100);
  
  try {
    const response = await axios.get(url, {
      timeout: 30000,
      headers: {
        'Accept': 'application/atom+xml,application/pdf',
        'User-Agent': 'mcp-arxiv/1.0.0'
      }
    });
    
    if (response.status >= 300) {
      throw new Error(`Failed to fetch paper: ${response.status} ${response.statusText}`);
    }
    
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<any>;
    throw new Error(`Failed to fetch paper ${paperId}: ${axiosError?.message}`);
  }
}

/**
 * Sleep for a specified number of milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
