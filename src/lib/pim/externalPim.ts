// External PIM Adapter - Uses external PIM API with Bearer token authentication
import { createPimClient, PimProductListItem, PimProductAttribute, PimProductIdentifier, PimClient } from './pimClient';
import type { Product, ProductAttributes } from './productGenerator';

let client: PimClient | null = null;

function getClient(): PimClient {
  if (!client) {
    client = createPimClient();
  }
  return client;
}

// Cache for products (optional, can be disabled in production)
let productCache: Map<string, Product> | null = null;
let allProductsCache: Product[] | null = null;
let productCountCache: number | null = null;
let categoriesCache: string[] | null = null;

// Helper to extract SKU from identifiers array
function extractSku(identifiers: PimProductIdentifier[]): string {
  const skuIdentifier = identifiers.find(i => i.type === 'sku');
  return skuIdentifier?.value || '';
}

// Helper to extract attribute value by key
function getAttributeValue(
  attributes: PimProductAttribute[],
  key: string
): string | null {
  const attr = attributes.find(a => a.key === key);
  return attr?.value ?? null;
}

// Convert PIM product to internal Product format
function convertFromPim(pimProduct: PimProductListItem): Product {
  const sku = extractSku(pimProduct.identifiers);

  // Extract core fields from attributes
  const name = getAttributeValue(pimProduct.attributes, 'name') || 'Unknown Product';
  const description = getAttributeValue(pimProduct.attributes, 'description') || '';
  const priceStr = getAttributeValue(pimProduct.attributes, 'price');
  const price = priceStr ? parseFloat(priceStr) : 0;
  const currency = getAttributeValue(pimProduct.attributes, 'currency') || 'USD';
  const category = getAttributeValue(pimProduct.attributes, 'category') || 'Unknown';
  const stockStr = getAttributeValue(pimProduct.attributes, 'stock');
  const stock = stockStr ? parseInt(stockStr, 10) : 0;

  // Parse images - can be JSON array or single URL
  let images: string[] = [];
  const imagesStr = getAttributeValue(pimProduct.attributes, 'images');
  if (imagesStr) {
    try {
      const parsed = JSON.parse(imagesStr);
      images = Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      // If not JSON, treat as single URL
      images = [imagesStr];
    }
  }

  // Fallback image if none provided
  if (images.length === 0) {
    images = [`https://placehold.co/400x300/8B4513/F5DEB3?text=${encodeURIComponent(name.substring(0, 20))}`];
  }

  // Extract product-specific attributes
  const attributes: ProductAttributes = {};
  const attrKeys: (keyof ProductAttributes)[] = [
    'woodType', 'finish', 'dimensions', 'grade', 'type', 'material',
    'brand', 'bladeLength', 'pieces', 'size', 'capacity', 'power',
    'padSize', 'packSize', 'diameter', 'length', 'sizes', 'pins'
  ];

  for (const key of attrKeys) {
    const value = getAttributeValue(pimProduct.attributes, key);
    if (value) {
      attributes[key] = value;
    }
  }

  return {
    id: sku || pimProduct.id, // Use SKU as ID, fallback to PIM ID
    sku: sku || pimProduct.id,
    name,
    description,
    price,
    currency,
    category,
    attributes,
    stock,
    images,
  };
}

// Fetch all published products with pagination handling
async function fetchAllProducts(): Promise<Product[]> {
  const pimClient = getClient();
  const allProducts: Product[] = [];
  let page = 1;
  const limit = 100;
  let hasMore = true;

  while (hasMore) {
    const response = await pimClient.getProducts({ page, limit, status: 'published' });
    allProducts.push(...response.data.map(convertFromPim));

    hasMore = page < response.pagination.totalPages;
    page++;
  }

  return allProducts;
}

export async function getProducts(options: { offset?: number; limit?: number } = {}): Promise<Product[]> {
  // If no cache, fetch all products
  if (!allProductsCache) {
    allProductsCache = await fetchAllProducts();
  }

  // Apply offset and limit
  const offset = options.offset || 0;
  const limit = options.limit || allProductsCache.length;

  return allProductsCache.slice(offset, offset + limit);
}

export async function getProductById(id: string): Promise<Product | null> {
  // Check cache first
  if (productCache?.has(id)) {
    return productCache.get(id) || null;
  }

  // Try to find in allProductsCache by SKU
  if (allProductsCache) {
    const product = allProductsCache.find(p => p.id === id || p.sku === id);
    if (product) return product;
  }

  // Fetch from API - search by SKU
  try {
    const pimClient = getClient();
    const response = await pimClient.getProducts({ search: id, limit: 10, status: 'published' });

    // Find exact match by SKU
    for (const pimProduct of response.data) {
      const sku = extractSku(pimProduct.identifiers);
      if (sku === id) {
        const product = convertFromPim(pimProduct);
        // Cache the result
        if (!productCache) productCache = new Map();
        productCache.set(id, product);
        return product;
      }
    }

    // Try fetching by PIM ID directly
    try {
      const pimProduct = await pimClient.getProduct(id);
      const product = convertFromPim(pimProduct);
      if (!productCache) productCache = new Map();
      productCache.set(id, product);
      return product;
    } catch {
      // Product not found
      return null;
    }
  } catch {
    return null;
  }
}

export async function getProductBySku(sku: string): Promise<Product | null> {
  // Same as getProductById since we use SKU as ID
  return getProductById(sku);
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return [];

  // Ensure all products are cached
  if (!allProductsCache) {
    allProductsCache = await fetchAllProducts();
  }

  // Filter by IDs (which are SKUs)
  const idSet = new Set(ids);
  return allProductsCache.filter(p => idSet.has(p.id) || idSet.has(p.sku));
}

export async function getProductsBySku(skus: string[]): Promise<Product[]> {
  // Same as getProductsByIds since we use SKU as ID
  return getProductsByIds(skus);
}

export async function searchProducts(
  query: string,
  options: { category?: string; offset?: number; limit?: number } = {}
): Promise<{ products: Product[]; total: number }> {
  const pimClient = getClient();

  // Use PIM API search (only published products)
  const response = await pimClient.getProducts({
    search: query,
    limit: options.limit || 20,
    page: options.offset ? Math.floor(options.offset / (options.limit || 20)) + 1 : 1,
    status: 'published',
  });

  let products = response.data.map(convertFromPim);

  // Filter by category if specified (client-side filtering since PIM may not support it)
  if (options.category) {
    products = products.filter(p =>
      p.category.toLowerCase() === options.category!.toLowerCase()
    );
  }

  return {
    products,
    total: response.pagination.total,
  };
}

export async function getProductCount(): Promise<number> {
  if (productCountCache !== null) {
    return productCountCache;
  }

  const pimClient = getClient();
  const response = await pimClient.getProducts({ limit: 1, status: 'published' });
  productCountCache = response.pagination.total;

  return productCountCache;
}

export async function getCategories(): Promise<string[]> {
  if (categoriesCache) {
    return categoriesCache;
  }

  // Get categories from PIM API
  const pimClient = getClient();
  const response = await pimClient.getCategories({ limit: 100 });

  // Extract category names
  const categories = response.data.map(c => c.name);

  // Filter to main categories we support
  const mainCategories = ['Wood', 'Tools', 'Hardware'];
  categoriesCache = categories.filter(name => mainCategories.includes(name));

  // If no matching categories, use defaults
  if (categoriesCache.length === 0) {
    categoriesCache = mainCategories;
  }

  return categoriesCache;
}

// Clear all caches
export function clearCache(): void {
  productCache = null;
  allProductsCache = null;
  productCountCache = null;
  categoriesCache = null;
}
