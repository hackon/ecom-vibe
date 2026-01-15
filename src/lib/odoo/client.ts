import { XmlRpcClient, XmlRpcValue } from '@foxglove/xmlrpc';

export interface OdooConfig {
  url: string;
  db: string;
  username: string;
  apiKey: string;
}

export interface OdooProduct {
  id?: number;
  name: string;
  default_code?: string; // SKU/Internal Reference
  list_price: number;
  description?: string;
  description_sale?: string;
  categ_id?: number | [number, string]; // Category
  type?: 'consu' | 'service' | 'product'; // Product type
  sale_ok?: boolean;
  purchase_ok?: boolean;
  active?: boolean;
  // Stock fields
  qty_available?: number;
  // Custom fields for our attributes (stored in description or custom fields)
  x_attributes?: string; // JSON string of custom attributes
}

// Odoo domain filter type - array of conditions
type OdooDomainItem = string | number | boolean | string[] | number[];
type OdooDomain = OdooDomainItem[];

export class OdooClient {
  private config: OdooConfig;
  private uid: number | null = null;
  private commonClient: XmlRpcClient;
  private objectClient: XmlRpcClient;

  constructor(config: OdooConfig) {
    this.config = config;
    this.commonClient = new XmlRpcClient(`${config.url}/xmlrpc/2/common`);
    this.objectClient = new XmlRpcClient(`${config.url}/xmlrpc/2/object`);
  }

  async authenticate(): Promise<number> {
    if (this.uid) return this.uid;

    try {
      const result = await this.commonClient.methodCall('authenticate', [
        this.config.db,
        this.config.username,
        this.config.apiKey,
        {},
      ]);

      // Odoo returns false (boolean) when auth fails, or uid (number) on success
      if (typeof result === 'number' && result > 0) {
        this.uid = result;
        return this.uid;
      }

      if (result === false || result === 0) {
        throw new Error('Authentication failed - invalid credentials or API key');
      }

      throw new Error(`Unexpected authentication response: ${JSON.stringify(result)}`);
    } catch (error) {
      console.error('Odoo authentication error:', error);
      throw error;
    }
  }

  async version(): Promise<Record<string, XmlRpcValue>> {
    const result = await this.commonClient.methodCall('version', []);
    return result as Record<string, XmlRpcValue>;
  }

  private async execute<T>(
    model: string,
    method: string,
    args: XmlRpcValue[],
    kwargs: Record<string, XmlRpcValue> = {}
  ): Promise<T> {
    const uid = await this.authenticate();

    const result = await this.objectClient.methodCall('execute_kw', [
      this.config.db,
      uid,
      this.config.apiKey,
      model,
      method,
      args,
      kwargs,
    ]);

    return result as T;
  }

  // Generic model methods
  async search(
    model: string,
    domain: OdooDomain[] = [],
    options: { offset?: number; limit?: number; order?: string } = {}
  ): Promise<number[]> {
    return this.execute<number[]>(model, 'search', [domain as XmlRpcValue], options as Record<string, XmlRpcValue>);
  }

  async searchRead<T>(
    model: string,
    domain: OdooDomain[] = [],
    options: { fields?: string[]; offset?: number; limit?: number; order?: string } = {}
  ): Promise<T[]> {
    return this.execute<T[]>(model, 'search_read', [domain as XmlRpcValue], options as Record<string, XmlRpcValue>);
  }

  async read<T>(
    model: string,
    ids: number[],
    fields?: string[]
  ): Promise<T[]> {
    const kwargs: Record<string, XmlRpcValue> = fields ? { fields } : {};
    return this.execute<T[]>(model, 'read', [ids], kwargs);
  }

  async create(model: string, values: Record<string, XmlRpcValue>): Promise<number> {
    return this.execute<number>(model, 'create', [values]);
  }

  async write(
    model: string,
    ids: number[],
    values: Record<string, XmlRpcValue>
  ): Promise<boolean> {
    return this.execute<boolean>(model, 'write', [ids, values]);
  }

  async unlink(model: string, ids: number[]): Promise<boolean> {
    return this.execute<boolean>(model, 'unlink', [ids]);
  }

  async searchCount(model: string, domain: OdooDomain[] = []): Promise<number> {
    return this.execute<number>(model, 'search_count', [domain as XmlRpcValue]);
  }

  async fieldsGet(
    model: string,
    fields?: string[],
    attributes?: string[]
  ): Promise<Record<string, XmlRpcValue>> {
    const kwargs: Record<string, XmlRpcValue> = {};
    if (fields) kwargs.allfields = fields;
    if (attributes) kwargs.attributes = attributes;
    return this.execute<Record<string, XmlRpcValue>>(model, 'fields_get', [], kwargs);
  }

  // Product-specific methods
  async getProducts(
    domain: OdooDomain[] = [],
    options: { fields?: string[]; offset?: number; limit?: number } = {}
  ): Promise<OdooProduct[]> {
    const defaultFields = [
      'id',
      'name',
      'default_code',
      'list_price',
      'description',
      'description_sale',
      'categ_id',
      'type',
      'sale_ok',
      'purchase_ok',
      'active',
      'qty_available',
    ];

    return this.searchRead<OdooProduct>('product.template', domain, {
      fields: options.fields || defaultFields,
      offset: options.offset,
      limit: options.limit,
    });
  }

  async getProductById(id: number): Promise<OdooProduct | null> {
    const products = await this.read<OdooProduct>('product.template', [id]);
    return products.length > 0 ? products[0] : null;
  }

  async getProductBySku(sku: string): Promise<OdooProduct | null> {
    const products = await this.searchRead<OdooProduct>(
      'product.template',
      [['default_code', '=', sku]],
      { limit: 1 }
    );
    return products.length > 0 ? products[0] : null;
  }

  async createProduct(product: Omit<OdooProduct, 'id'>): Promise<number> {
    return this.create('product.template', product as Record<string, XmlRpcValue>);
  }

  async updateProduct(id: number, values: Partial<OdooProduct>): Promise<boolean> {
    return this.write('product.template', [id], values as Record<string, XmlRpcValue>);
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.unlink('product.template', [id]);
  }

  async getProductCount(domain: OdooDomain[] = []): Promise<number> {
    return this.searchCount('product.template', domain);
  }

  // Category methods
  async getCategories(
    domain: OdooDomain[] = [],
    options: { fields?: string[]; offset?: number; limit?: number } = {}
  ): Promise<{ id: number; name: string; parent_id?: [number, string] }[]> {
    return this.searchRead('product.category', domain, {
      fields: options.fields || ['id', 'name', 'parent_id', 'complete_name'],
      ...options,
    });
  }

  async createCategory(name: string, parentId?: number): Promise<number> {
    const values: Record<string, XmlRpcValue> = { name };
    if (parentId) values.parent_id = parentId;
    return this.create('product.category', values);
  }

  // Stock/Inventory methods (requires stock module)
  async getProductStock(productId: number): Promise<number> {
    const products = await this.read<{ qty_available: number }>(
      'product.product',
      [productId],
      ['qty_available']
    );
    return products.length > 0 ? products[0].qty_available : 0;
  }
}

// Default configuration from environment
export function createOdooClient(config?: Partial<OdooConfig>): OdooClient {
  const url = config?.url || process.env.ODOO_URL;
  const db = config?.db || process.env.ODOO_DB;
  const username = config?.username || process.env.ODOO_USERNAME;
  const apiKey = config?.apiKey || process.env.ODOO_API_KEY;

  if (!url) throw new Error('ODOO_URL environment variable is required');
  if (!db) throw new Error('ODOO_DB environment variable is required');
  if (!username) throw new Error('ODOO_USERNAME environment variable is required');
  if (!apiKey) throw new Error('ODOO_API_KEY environment variable is required');

  return new OdooClient({ url, db, username, apiKey });
}
