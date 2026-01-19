/**
 * Strapi API Client
 *
 * Handles communication with Strapi REST API for content management.
 * This is the 3rd party layer - backend should access CMS through this client.
 *
 * Uses Strapi v5 REST API
 */

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_TOKEN;

if (!STRAPI_TOKEN) {
  console.warn('STRAPI_TOKEN not set. Strapi client will not work.');
}

export interface StrapiResponse<T> {
  data: T;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
  error?: {
    status: number;
    name: string;
    message: string;
  };
}

export interface StrapiDocument {
  id: number;
  documentId: string;
  [key: string]: unknown;
}

export interface StrapiArticle extends StrapiDocument {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  image?: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface StrapiCarouselBlock extends StrapiDocument {
  title: string;
  blockType: 'carousel';
  visibleCount: number;
  productIds: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface StrapiHeroBanner extends StrapiDocument {
  title: string;
  blockType: 'hero-banner';
  subtitle?: string;
  backgroundColor: string;
  textColor: string;
  link?: string;
  linkText?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface StrapiHomePage extends StrapiDocument {
  title: string;
  slug: string;
  blocks: string; // JSON array of block documentIds
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

/**
 * Strapi Client using REST API v5
 */
export class StrapiClient {
  private baseUrl: string;
  private token: string;

  constructor(url: string = STRAPI_URL, token: string = STRAPI_TOKEN || '') {
    this.baseUrl = url.replace(/\/$/, '');
    this.token = token;
  }

  /**
   * REST API request wrapper
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<StrapiResponse<T>> {
    const url = `${this.baseUrl}/api${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Strapi API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return data as StrapiResponse<T>;
  }

  // ============================================
  // ARTICLE OPERATIONS
  // ============================================

  /**
   * Get all articles
   */
  async getArticles(): Promise<StrapiArticle[]> {
    const response = await this.request<StrapiArticle[]>('/articles');
    return response.data;
  }

  /**
   * Get article by slug
   */
  async getArticleBySlug(slug: string): Promise<StrapiArticle | null> {
    try {
      const response = await this.request<StrapiArticle[]>(
        `/articles?filters[slug][$eq]=${encodeURIComponent(slug)}`
      );
      return response.data.length > 0 ? response.data[0] : null;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Get article by documentId
   */
  async getArticle(documentId: string): Promise<StrapiArticle | null> {
    try {
      const response = await this.request<StrapiArticle>(`/articles/${documentId}`);
      return response.data;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Create new article
   */
  async createArticle(article: Omit<StrapiArticle, 'id' | 'documentId' | 'createdAt' | 'updatedAt' | 'publishedAt'>): Promise<StrapiArticle> {
    const response = await this.request<StrapiArticle>('/articles', {
      method: 'POST',
      body: JSON.stringify({ data: article }),
    });
    return response.data;
  }

  /**
   * Update article
   */
  async updateArticle(documentId: string, article: Partial<Omit<StrapiArticle, 'id' | 'documentId' | 'createdAt' | 'updatedAt' | 'publishedAt'>>): Promise<StrapiArticle> {
    const response = await this.request<StrapiArticle>(`/articles/${documentId}`, {
      method: 'PUT',
      body: JSON.stringify({ data: article }),
    });
    return response.data;
  }

  /**
   * Delete article
   */
  async deleteArticle(documentId: string): Promise<void> {
    await this.request<void>(`/articles/${documentId}`, {
      method: 'DELETE',
    });
  }

  // ============================================
  // CAROUSEL BLOCK OPERATIONS
  // ============================================

  /**
   * Get all carousel blocks
   */
  async getCarouselBlocks(): Promise<StrapiCarouselBlock[]> {
    const response = await this.request<StrapiCarouselBlock[]>('/carousel-blocks');
    return response.data;
  }

  /**
   * Get carousel block by documentId
   */
  async getCarouselBlock(documentId: string): Promise<StrapiCarouselBlock | null> {
    try {
      const response = await this.request<StrapiCarouselBlock>(`/carousel-blocks/${documentId}`);
      return response.data;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Create carousel block
   */
  async createCarouselBlock(block: Omit<StrapiCarouselBlock, 'id' | 'documentId' | 'createdAt' | 'updatedAt' | 'publishedAt'>): Promise<StrapiCarouselBlock> {
    const response = await this.request<StrapiCarouselBlock>('/carousel-blocks', {
      method: 'POST',
      body: JSON.stringify({ data: block }),
    });
    return response.data;
  }

  // ============================================
  // HERO BANNER OPERATIONS
  // ============================================

  /**
   * Get all hero banners
   */
  async getHeroBanners(): Promise<StrapiHeroBanner[]> {
    const response = await this.request<StrapiHeroBanner[]>('/hero-banners');
    return response.data;
  }

  /**
   * Get hero banner by documentId
   */
  async getHeroBanner(documentId: string): Promise<StrapiHeroBanner | null> {
    try {
      const response = await this.request<StrapiHeroBanner>(`/hero-banners/${documentId}`);
      return response.data;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Create hero banner
   */
  async createHeroBanner(banner: Omit<StrapiHeroBanner, 'id' | 'documentId' | 'createdAt' | 'updatedAt' | 'publishedAt'>): Promise<StrapiHeroBanner> {
    const response = await this.request<StrapiHeroBanner>('/hero-banners', {
      method: 'POST',
      body: JSON.stringify({ data: banner }),
    });
    return response.data;
  }

  // ============================================
  // HOME PAGE OPERATIONS
  // ============================================

  /**
   * Get home page
   */
  async getHomePage(): Promise<StrapiHomePage | null> {
    try {
      const response = await this.request<StrapiHomePage[]>(
        '/home-pages?filters[slug][$eq]=/'
      );
      return response.data.length > 0 ? response.data[0] : null;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Create home page
   */
  async createHomePage(homePage: Omit<StrapiHomePage, 'id' | 'documentId' | 'createdAt' | 'updatedAt' | 'publishedAt'>): Promise<StrapiHomePage> {
    const response = await this.request<StrapiHomePage>('/home-pages', {
      method: 'POST',
      body: JSON.stringify({ data: homePage }),
    });
    return response.data;
  }

  /**
   * Update home page
   */
  async updateHomePage(documentId: string, homePage: Partial<Omit<StrapiHomePage, 'id' | 'documentId' | 'createdAt' | 'updatedAt' | 'publishedAt'>>): Promise<StrapiHomePage> {
    const response = await this.request<StrapiHomePage>(`/home-pages/${documentId}`, {
      method: 'PUT',
      body: JSON.stringify({ data: homePage }),
    });
    return response.data;
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * Test connection to Strapi
   */
  async testConnection(): Promise<boolean> {
    try {
      // Try to fetch articles (will work even if empty)
      await this.request('/articles?pagination[pageSize]=1');
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Create a Strapi client instance
 */
export function createStrapiClient(): StrapiClient {
  return new StrapiClient();
}
