/**
 * DotCMS API Client
 *
 * Handles communication with DotCMS REST API for content management.
 * This is the 3rd party layer - backend should access CMS through this client.
 *
 * Uses direct REST API calls for full control and compatibility.
 * The official @dotcms/client SDK is available but designed for page-based workflows.
 */

const DOTCMS_URL = process.env.DOTCMS_URL || 'http://localhost:8082';
const DOTCMS_API_KEY = process.env.DOTCMS_API_KEY;

if (!DOTCMS_API_KEY) {
  console.warn('DOTCMS_API_KEY not set. DotCMS client will not work.');
}

export interface DotCMSResponse<T> {
  entity: T;
  errors: string[];
  i18nMessagesMap: Record<string, string>;
  messages: string[];
  pagination?: {
    page: number;
    perPage: number;
    totalEntries: number;
  };
}

export interface DotCMSContentType {
  id?: string;
  name: string;
  variable: string;
  description: string;
  baseType: 'CONTENT' | 'WIDGET' | 'FORM' | 'FILEASSET' | 'HTMLPAGE' | 'PERSONA';
  clazz?: string;
  defaultType?: boolean;
  host?: string;
  owner?: string;
  fixed?: boolean;
  system?: boolean;
  folder?: string;
  icon?: string;
  workflow?: string[];
  fields: DotCMSField[];
}

export interface DotCMSField {
  name: string;
  variable: string;
  fieldType: string;
  dataType: 'TEXT' | 'LONG_TEXT' | 'INTEGER' | 'FLOAT' | 'BOOL' | 'DATE' | 'TIME' | 'DATE_TIME' | 'BINARY' | 'SYSTEM';
  required: boolean;
  indexed: boolean;
  listed: boolean;
  searchable?: boolean;
  unique?: boolean;
  defaultValue?: string | number | boolean;
  hint?: string;
  regexCheck?: string;
  values?: string;
  sortOrder: number;
}

export interface DotCMSContent {
  identifier?: string;
  inode?: string;
  contentType: string;
  title?: string;
  languageId?: number;
  [key: string]: unknown;
}

/**
 * DotCMS Client using REST API
 */
export class DotCMSClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(url: string = DOTCMS_URL, apiKey: string = DOTCMS_API_KEY || '') {
    this.baseUrl = url.replace(/\/$/, '');
    this.apiKey = apiKey;
  }

  /**
   * REST API request wrapper
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<DotCMSResponse<T>> {
    const url = `${this.baseUrl}/api${endpoint}`;

    // Debug logging
    if (options.method === 'POST' && options.body && typeof options.body === 'string') {
      console.log('POST Request Debug:');
      console.log('  URL:', url);
      console.log('  Method:', options.method);
      console.log('  Body type:', typeof options.body);
      console.log('  Body length:', options.body.length);
      console.log('  First 20 chars:', JSON.stringify(options.body.substring(0, 20)));
      console.log('  Body:', options.body);
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json; charset=utf-8',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DotCMS API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();

    // DotCMS can return data wrapped in `entity` or directly
    // Handle both formats
    if (data && typeof data === 'object' && 'entity' in data) {
      return data as DotCMSResponse<T>;
    }

    // If data is returned directly, wrap it
    return {
      entity: data as T,
      errors: [],
      i18nMessagesMap: {},
      messages: [],
    } as DotCMSResponse<T>;
  }

  // ============================================
  // CONTENT TYPE OPERATIONS
  // ============================================

  /**
   * Get all content types
   */
  async getContentTypes(): Promise<DotCMSContentType[]> {
    const response = await this.request<DotCMSContentType[]>('/v1/contenttype');
    return response.entity;
  }

  /**
   * Get content type by variable name
   */
  async getContentTypeByVariable(variable: string): Promise<DotCMSContentType | null> {
    try {
      const response = await this.request<DotCMSContentType>(`/v1/contenttype/id/${variable}`);
      return response.entity;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Create a new content type
   */
  async createContentType(contentType: DotCMSContentType): Promise<DotCMSContentType> {
    // DotCMS expects a single JSON object, not an array
    const response = await this.request<DotCMSContentType>('/v1/contenttype', {
      method: 'POST',
      body: JSON.stringify(contentType),
    });
    return response.entity;
  }

  /**
   * Update an existing content type
   */
  async updateContentType(id: string, contentType: Partial<DotCMSContentType>): Promise<DotCMSContentType> {
    const response = await this.request<DotCMSContentType>(`/v1/contenttype/id/${id}`, {
      method: 'PUT',
      body: JSON.stringify(contentType),
    });
    return response.entity;
  }

  /**
   * Delete a content type
   */
  async deleteContentType(id: string): Promise<void> {
    await this.request<void>(`/v1/contenttype/id/${id}`, {
      method: 'DELETE',
    });
  }

  // ============================================
  // CONTENT OPERATIONS
  // ============================================

  /**
   * Search for content using Elasticsearch query
   */
  async searchContent<T extends DotCMSContent>(
    query: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<T[]> {
    try {
      // DotCMS uses /api/content endpoint with Elasticsearch query
      const response = await this.request<{ contentlets: T[] }>(
        `/api/content/query/${query}`,
        // {
        //   method: 'GET',
        //   body: JSON.stringify({
        //     query,
        //     limit,
        //     offset,
        //   }),
        // }
      );
      return response.entity.contentlets || [];
    } catch (error) {
      // Return empty array if search fails (content type might not exist yet)
      console.warn('Content search failed:', error);
      return [];
    }
  }

  /**
   * Get content by identifier
   */
  async getContent<T extends DotCMSContent>(identifier: string): Promise<T | null> {
    try {
      const response = await this.request<T>(`/v1/content/${identifier}`);
      return response.entity;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Create new content
   */
  async createContent<T extends DotCMSContent>(content: T): Promise<T> {
    const response = await this.request<T>('/v1/content', {
      method: 'POST',
      body: JSON.stringify(content),
    });
    return response.entity;
  }

  /**
   * Update existing content
   */
  async updateContent<T extends DotCMSContent>(identifier: string, content: Partial<T>): Promise<T> {
    const response = await this.request<T>(`/v1/content/${identifier}`, {
      method: 'PUT',
      body: JSON.stringify(content),
    });
    return response.entity;
  }

  /**
   * Delete content
   */
  async deleteContent(identifier: string): Promise<void> {
    await this.request<void>(`/v1/content/${identifier}`, {
      method: 'DELETE',
    });
  }

  /**
   * Publish content
   */
  async publishContent(identifier: string): Promise<void> {
    await this.request<void>(`/v1/workflow/actions/default/fire/PUBLISH`, {
      method: 'PUT',
      body: JSON.stringify({
        contentlet: {
          identifier,
        },
      }),
    });
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * Test connection to DotCMS
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.request('/v1/contenttype?per_page=1');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get the default site/host information
   */
  async getDefaultSite(): Promise<{ identifier: string; hostname: string }> {
    try {
      const response = await this.request<{ identifier: string; hostname: string }[]>('/v1/site');
      // Return the first site (usually the default site)
      return response.entity[0];
    } catch {
      // Fallback to a common default if the API call fails
      return { identifier: 'SYSTEM_HOST', hostname: 'default' };
    }
  }
}

/**
 * Create a DotCMS client instance
 */
export function createDotCMSClient(): DotCMSClient {
  return new DotCMSClient();
}
