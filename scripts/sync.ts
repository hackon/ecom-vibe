/**
 * Unified Sync Script
 *
 * Syncs products from External PIM API → Solr
 *
 * Usage: npx tsx --env-file=.env scripts/sync.ts
 */

import { createPimClient, PimProductListItem, PimProductAttribute, PimProductIdentifier, PimCategory } from '../src/lib/pim/pimClient';
import { ProductAttributes } from '../src/lib/pim/productGenerator';

const SOLR_URL = process.env.SOLR_URL || 'http://localhost:8983/solr/products';
const SOLR_BATCH_SIZE = 100;

// Category map for resolving category IDs to names
let categoryMap: Map<string, PimCategory> = new Map();

interface ProductFromPim {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  attributes: ProductAttributes;
  stock: number;
  images: string[];
}

interface SolrDocument {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  stock: number;
  images: string[];
  woodType?: string;
  finish?: string;
  dimensions?: string;
  grade?: string;
  type?: string;
  material?: string;
  brand?: string;
  packSize?: string;
  size?: string;
  power?: string;
}

// ============================================
// PIM HELPER FUNCTIONS
// ============================================

function extractSku(identifiers: PimProductIdentifier[]): string {
  const skuIdentifier = identifiers.find(i => i.type === 'sku');
  return skuIdentifier?.value || '';
}

function getAttributeValue(attributes: PimProductAttribute[], key: string): string | null {
  const attr = attributes.find(a => a.key === key);
  return attr?.value ?? null;
}

function convertFromPim(pimProduct: PimProductListItem): ProductFromPim {
  console.log(`Converting PIM product ID: ${JSON.stringify(pimProduct)}`);
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

  // Parse images
  let images: string[] = [];
  const imagesStr = getAttributeValue(pimProduct.attributes, 'images');
  if (imagesStr) {
    try {
      const parsed = JSON.parse(imagesStr);
      images = Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      images = [imagesStr];
    }
  }

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
    id: sku || pimProduct.id,
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

// ============================================
// PULL FROM PIM FUNCTIONS
// ============================================

async function pullCategoriesFromPim(): Promise<PimCategory[]> {
  console.log('\nPulling categories from PIM API...');

  const client = createPimClient();
  const allCategories: PimCategory[] = [];
  let page = 1;
  const limit = 100;
  let hasMore = true;

  while (hasMore) {
    console.log(`  Fetching categories page ${page}...`);
    const response = await client.getCategories({ page, limit });

    // Handle both flat and tree responses
    const categories = response.data as PimCategory[];
    allCategories.push(...categories);

    console.log(`  Retrieved ${categories.length} categories (total: ${allCategories.length})`);

    hasMore = response.pagination ? page < response.pagination.totalPages : false;
    page++;
  }

  // Build category map for quick lookup
  categoryMap = new Map(allCategories.map(c => [c.id, c]));

  console.log(`Retrieved ${allCategories.length} categories from PIM`);

  return allCategories;
}

async function pullFromPim(): Promise<ProductFromPim[]> {
  console.log('\nPulling published products from PIM API...');

  const client = createPimClient();
  const allProducts: ProductFromPim[] = [];
  let page = 1;
  const limit = 100;
  let hasMore = true;

  while (hasMore) {
    console.log(`  Fetching page ${page}...`);
    const response = await client.getProducts({ page, limit, status: 'published' });

    const products = response.data.map(convertFromPim);
    allProducts.push(...products);

    console.log(`  Retrieved ${products.length} products (total: ${allProducts.length})`);

    hasMore = page < response.pagination.totalPages;
    page++;
  }

  console.log(`Retrieved ${allProducts.length} products from PIM`);

  return allProducts;
}

// ============================================
// SOLR SYNC FUNCTIONS
// ============================================

function productToSolrDoc(product: ProductFromPim): SolrDocument {
  return {
    id: product.id,
    sku: product.sku,
    name: product.name,
    description: product.description,
    price: product.price,
    currency: product.currency,
    category: product.category,
    stock: product.stock,
    images: product.images,
    // Flatten attributes
    woodType: product.attributes.woodType,
    finish: product.attributes.finish,
    dimensions: product.attributes.dimensions,
    grade: product.attributes.grade,
    type: product.attributes.type,
    material: product.attributes.material,
    brand: product.attributes.brand,
    packSize: product.attributes.packSize,
    size: product.attributes.size,
    power: product.attributes.power,
  };
}

async function waitForSolr(maxRetries = 30, delayMs = 2000): Promise<boolean> {
  console.log('\nWaiting for Solr to be ready...');

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(`${SOLR_URL}/select?q=*:*&rows=0&wt=json`);
      if (response.ok) {
        console.log('Solr is ready!');
        return true;
      }
      console.log(`Response status: ${response.status}`);
    } catch (error) {
      console.log(`Connection error: ${error instanceof Error ? error.message : 'unknown'}`);
    }
    console.log(`Attempt ${i + 1}/${maxRetries} - Solr not ready, waiting ${delayMs}ms...`);
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }

  return false;
}

async function clearSolrIndex(): Promise<void> {
  console.log('Clearing existing Solr index...');
  const response = await fetch(`${SOLR_URL}/update?commit=true`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ delete: { query: '*:*' } }),
  });

  if (!response.ok) {
    throw new Error(`Failed to clear index: ${response.statusText}`);
  }
  console.log('Solr index cleared.');
}

async function indexToSolr(products: SolrDocument[]): Promise<void> {
  console.log(`Indexing ${products.length} products to Solr...`);

  for (let i = 0; i < products.length; i += SOLR_BATCH_SIZE) {
    const batch = products.slice(i, i + SOLR_BATCH_SIZE);

    const response = await fetch(`${SOLR_URL}/update?commit=true`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(batch),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to index batch ${i / SOLR_BATCH_SIZE + 1}: ${errorText}`);
    }

    console.log(`Indexed batch ${Math.floor(i / SOLR_BATCH_SIZE) + 1}/${Math.ceil(products.length / SOLR_BATCH_SIZE)}`);
  }

  console.log('All products indexed to Solr!');
}

async function verifySolrIndex(): Promise<void> {
  console.log('Verifying Solr index...');
  const response = await fetch(`${SOLR_URL}/select?q=*:*&rows=0&wt=json`);
  const data = await response.json();
  console.log(`Total documents in Solr: ${data.response.numFound}`);

  const facetResponse = await fetch(`${SOLR_URL}/browse?q=*:*&rows=0`);
  const facetData = await facetResponse.json();
  console.log('Facet counts:');
  if (facetData.facet_counts?.facet_fields) {
    for (const [field, values] of Object.entries(facetData.facet_counts.facet_fields)) {
      const arr = values as (string | number)[];
      const count = arr.filter((_, i) => i % 2 === 0).length;
      console.log(`  - ${field}: ${count} unique values`);
    }
  }
}

// ============================================
// MAIN
// ============================================

async function main() {
  console.log('===========================================');
  console.log('  Unified Product Sync');
  console.log('  External PIM API → Solr');
  console.log('===========================================\n');

  try {
    // PHASE 1: Pull categories from PIM
    console.log('PHASE 1: Pulling categories from PIM API');
    console.log('-------------------------------------------');

    const categoriesFromPim = await pullCategoriesFromPim();

    // Log category hierarchy
    console.log('\nCategories:');
    for (const category of categoriesFromPim) {
      const indent = '  '.repeat(category.level);
      console.log(`${indent}- ${category.name} (${category.code}) [${category.productCount} products]`);
    }

    // PHASE 2: Pull products from PIM
    console.log('\n-------------------------------------------');
    console.log('PHASE 2: Pulling products from PIM API');
    console.log('-------------------------------------------');

    const productsFromPim = await pullFromPim();

    if (productsFromPim.length === 0) {
      console.log('No products found in PIM. Exiting.');
      process.exit(0);
    }

    // PHASE 3: Sync to Solr
    console.log('\n-------------------------------------------');
    console.log('PHASE 3: Syncing products to Solr');
    console.log('-------------------------------------------');

    const solrReady = await waitForSolr();
    if (!solrReady) {
      console.error('Solr is not available. Make sure docker-compose is running.');
      process.exit(1);
    }

    const solrDocs = productsFromPim.map(productToSolrDoc);

    await clearSolrIndex();
    await indexToSolr(solrDocs);
    await verifySolrIndex();

    // Summary
    console.log('\n===========================================');
    console.log('  Sync Complete!');
    console.log('===========================================');
    console.log(`  Categories from PIM: ${categoriesFromPim.length}`);
    console.log(`  Products from PIM: ${productsFromPim.length}`);
    console.log(`  Products in Solr: ${solrDocs.length}`);
    console.log(`\nSolr Admin: http://localhost:8983/solr/#/products/query`);

  } catch (error) {
    console.error('Sync failed:', error);
    process.exit(1);
  }
}

main();
