// Odoo PIM Adapter - Uses Odoo as the Product Information Management system
import { createOdooClient, OdooProduct } from '../odoo/client';
import type { Product, ProductAttributes } from './productGenerator';

const client = createOdooClient();

// Category ID to name mapping (cached)
let categoryCache: Map<number, string> | null = null;

async function getCategoryMap(): Promise<Map<number, string>> {
  if (categoryCache) return categoryCache;

  const categories = await client.getCategories();
  categoryCache = new Map(categories.map(c => [c.id, c.name]));
  return categoryCache;
}

// Convert Odoo product to our Product format
function convertFromOdoo(odooProduct: OdooProduct, categoryMap: Map<number, string>): Product {
  // Extract category name
  let categoryName = 'Unknown';
  if (Array.isArray(odooProduct.categ_id)) {
    categoryName = odooProduct.categ_id[1];
  } else if (typeof odooProduct.categ_id === 'number') {
    categoryName = categoryMap.get(odooProduct.categ_id) || 'Unknown';
  }

  // Parse attributes from description if present
  let attributes: ProductAttributes = {};
  if (odooProduct.description) {
    const attrMatch = odooProduct.description.match(/--- Attributes ---\n([\s\S]*)/);
    if (attrMatch) {
      try {
        attributes = JSON.parse(attrMatch[1]);
      } catch {
        // If parsing fails, leave attributes empty
      }
    }
  }

  // Use SKU (default_code) as the product ID for cleaner URLs
  const sku = odooProduct.default_code || `ODOO-${odooProduct.id}`;

  return {
    id: sku,
    sku: sku,
    name: odooProduct.name,
    description: odooProduct.description_sale || odooProduct.description || '',
    price: odooProduct.list_price,
    currency: 'USD',
    category: categoryName,
    attributes,
    stock: odooProduct.qty_available || 0,
    images: [`https://placehold.co/400x300/8B4513/F5DEB3?text=${encodeURIComponent(odooProduct.name.substring(0, 20))}`],
  };
}

export async function getProducts(options: { offset?: number; limit?: number } = {}): Promise<Product[]> {
  const categoryMap = await getCategoryMap();

  const odooProducts = await client.getProducts(
    [['active', '=', true]],
    {
      offset: options.offset,
      limit: options.limit || 1000,
    }
  );

  return odooProducts.map(p => convertFromOdoo(p, categoryMap));
}

export async function getProductById(id: string): Promise<Product | null> {
  const categoryMap = await getCategoryMap();

  // ID is now SKU (default_code in Odoo)
  const product = await client.getProductBySku(id);
  if (!product) return null;

  return convertFromOdoo(product, categoryMap);
}

export async function getProductBySku(sku: string): Promise<Product | null> {
  const categoryMap = await getCategoryMap();

  const product = await client.getProductBySku(sku);
  if (!product) return null;

  return convertFromOdoo(product, categoryMap);
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  const categoryMap = await getCategoryMap();

  if (ids.length === 0) return [];

  // IDs are now SKUs (default_code in Odoo)
  const odooProducts = await client.getProducts([['default_code', 'in', ids]]);
  return odooProducts.map(p => convertFromOdoo(p, categoryMap));
}

export async function getProductsBySku(skus: string[]): Promise<Product[]> {
  const categoryMap = await getCategoryMap();

  if (skus.length === 0) return [];

  const odooProducts = await client.getProducts([['default_code', 'in', skus]]);
  return odooProducts.map(p => convertFromOdoo(p, categoryMap));
}

export async function searchProducts(
  query: string,
  options: { category?: string; offset?: number; limit?: number } = {}
): Promise<{ products: Product[]; total: number }> {
  const categoryMap = await getCategoryMap();

  // Build domain filter - Odoo domain is array of conditions
  type DomainItem = (string | number | boolean)[];
  const domain: (DomainItem | string)[] = [['active', '=', true]];

  // Add search query
  if (query) {
    domain.push('|', '|');
    domain.push(['name', 'ilike', query]);
    domain.push(['description', 'ilike', query]);
    domain.push(['default_code', 'ilike', query]);
  }

  // Add category filter
  if (options.category) {
    // Find category ID
    const categories = await client.getCategories([['name', '=', options.category]]);
    if (categories.length > 0) {
      domain.push(['categ_id', '=', categories[0].id]);
    }
  }

  // Get total count - cast domain for the client
  const total = await client.searchCount('product.template', domain as (string | number | boolean)[][]);

  // Get products
  const odooProducts = await client.getProducts(domain as (string | number | boolean)[][], {
    offset: options.offset,
    limit: options.limit || 20,
  });

  const products = odooProducts.map(p => convertFromOdoo(p, categoryMap));

  return { products, total };
}

export async function getProductCount(): Promise<number> {
  return client.getProductCount([['active', '=', true]]);
}

export async function getCategories(): Promise<string[]> {
  const categories = await client.getCategories();
  // Return only our main categories, not system ones
  const mainCategories = ['Wood', 'Tools', 'Hardware'];
  return categories
    .map(c => c.name)
    .filter(name => mainCategories.includes(name));
}

// Clear category cache (useful for testing)
export function clearCache() {
  categoryCache = null;
}
