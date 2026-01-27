// PIM API Client - Uses external PIM system with Bearer token authentication

export interface PimConfig {
  baseUrl: string;
  token: string;
}

// PIM API Types
export interface PimProductIdentifier {
  id: string;
  type: string;  // 'sku', 'ean', 'gtin', 'supplier_id', etc.
  value: string;
  isPrimary: boolean;
  createdAt?: string;
}

export interface PimProductAttribute {
  id: string;
  key: string;  // 'name', 'description', 'price', etc.
  type: string;  // 'string', 'number', 'boolean', 'date', 'json'
  value: string | null;
  locale: string | null;
  scope: string | null;
}

export interface PimProductCategoryAssociation {
  id: string;
  categoryId: string;
  isPrimary: boolean;
}

export interface PimProductClassificationAssociation {
  id: string;
  codeId: string;
  isPrimary: boolean;
}

// Product list item (returned from list endpoints)
export interface PimProductListItem {
  id: string;
  familyId: string;
  status: 'draft' | 'review' | 'approved' | 'published';
  completeness: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
  identifiers: PimProductIdentifier[];
  attributes: PimProductAttribute[];
}

// Full product (returned from single product endpoint)
export interface PimProduct extends PimProductListItem {
  categories: PimProductCategoryAssociation[];
  classifications: PimProductClassificationAssociation[];
}

// Alias for backwards compatibility
export type { PimProductListItem as PimProductBasic };

export interface PimCategory {
  id: string;
  code: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  level: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  subcategoryCount: number;
  productCount: number;
}

export interface PimCategoryTree extends PimCategory {
  children: PimCategoryTree[];
}

export interface PimPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PimProductsResponse {
  data: PimProductListItem[];
  pagination: PimPagination;
}

export interface PimCategoriesResponse {
  data: PimCategory[] | PimCategoryTree[];
  pagination?: PimPagination;
}

export class PimClient {
  private config: PimConfig;

  constructor(config: PimConfig) {
    this.config = config;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.config.token}`,
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`PIM API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
  }

  // API v1 endpoints (requires Bearer token authentication)
  async getProducts(options?: {
    page?: number;
    limit?: number;
    status?: 'draft' | 'review' | 'approved' | 'published';
    familyId?: string;
    search?: string;
  }): Promise<PimProductsResponse> {
    const params = new URLSearchParams();
    if (options?.page) params.set('page', options.page.toString());
    if (options?.limit) params.set('limit', options.limit.toString());
    if (options?.status) params.set('status', options.status);
    if (options?.familyId) params.set('familyId', options.familyId);
    if (options?.search) params.set('search', options.search);

    const query = params.toString();
    return this.request<PimProductsResponse>(`/api/v1/products${query ? `?${query}` : ''}`);
  }

  async getProduct(id: string): Promise<PimProduct> {
    return this.request<PimProduct>(`/api/v1/products/${encodeURIComponent(id)}`);
  }

  async getCategories(options?: {
    page?: number;
    limit?: number;
    parentId?: string;
    search?: string;
    tree?: boolean;
    rootId?: string;
  }): Promise<PimCategoriesResponse> {
    const params = new URLSearchParams();
    if (options?.page) params.set('page', options.page.toString());
    if (options?.limit) params.set('limit', options.limit.toString());
    if (options?.parentId) params.set('parentId', options.parentId);
    if (options?.search) params.set('search', options.search);
    if (options?.tree) params.set('tree', 'true');
    if (options?.rootId) params.set('rootId', options.rootId);

    const query = params.toString();
    return this.request<PimCategoriesResponse>(`/api/v1/categories${query ? `?${query}` : ''}`);
  }

  async getCategory(id: string): Promise<PimCategory> {
    return this.request<PimCategory>(`/api/v1/categories/${encodeURIComponent(id)}`);
  }

  async getCategoryProducts(categoryId: string, options?: {
    page?: number;
    limit?: number;
  }): Promise<PimProductsResponse> {
    const params = new URLSearchParams();
    if (options?.page) params.set('page', options.page.toString());
    if (options?.limit) params.set('limit', options.limit.toString());

    const query = params.toString();
    return this.request<PimProductsResponse>(
      `/api/v1/categories/${encodeURIComponent(categoryId)}/products${query ? `?${query}` : ''}`
    );
  }
}

// Factory function with environment variable defaults
export function createPimClient(config?: Partial<PimConfig>): PimClient {
  const baseUrl = config?.baseUrl || process.env.PIM_URL;
  const token = config?.token || process.env.PIM_TOKEN;

  if (!baseUrl) {
    throw new Error('PIM_URL environment variable is required');
  }
  if (!token) {
    throw new Error('PIM_TOKEN environment variable is required');
  }

  return new PimClient({ baseUrl, token });
}
