/**
 * Unified Sync Script
 *
 * Syncs products from products.json → Odoo → Solr
 *
 * The Odoo IDs become the canonical product IDs used throughout the system.
 *
 * Usage: npx tsx scripts/sync.ts
 */

import { createOdooClient, OdooClient, OdooProduct } from '../src/lib/odoo/client';
import { generatedProducts, Product, ProductAttributes } from '../src/lib/pim/productGenerator';

const SOLR_URL = process.env.SOLR_URL || 'http://localhost:8983/solr/products';
const ODOO_BATCH_SIZE = 50;
const SOLR_BATCH_SIZE = 100;

interface CategoryMap {
  [key: string]: number;
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
// ODOO SYNC FUNCTIONS
// ============================================

async function ensureCategories(client: OdooClient): Promise<CategoryMap> {
  console.log('Setting up product categories...');

  const categoryNames = ['Wood', 'Tools', 'Hardware'];
  const categoryMap: CategoryMap = {};

  const existingCategories = await client.getCategories();
  const existingMap = new Map(existingCategories.map(c => [c.name, c.id]));

  let parentId = existingMap.get('Saleable') || existingMap.get('All') || 1;

  for (const name of categoryNames) {
    const existing = existingCategories.find(c => c.name === name);
    if (existing) {
      categoryMap[name] = existing.id;
      console.log(`  Category "${name}" already exists with ID: ${existing.id}`);
    } else {
      const id = await client.createCategory(name, parentId);
      categoryMap[name] = id;
      console.log(`  Created category "${name}" with ID: ${id}`);
    }
  }

  return categoryMap;
}

function convertProductToOdoo(product: Product, categoryMap: CategoryMap) {
  const attributesJson = JSON.stringify(product.attributes, null, 2);
  const fullDescription = `${product.description}\n\n--- Attributes ---\n${attributesJson}`;

  return {
    name: product.name,
    default_code: product.sku,
    list_price: product.price,
    description_sale: product.description,
    description: fullDescription,
    categ_id: categoryMap[product.category] || 1,
    type: 'product' as const,
    sale_ok: true,
    purchase_ok: true,
    active: true,
  };
}

async function syncToOdoo(client: OdooClient, products: Product[], categoryMap: CategoryMap): Promise<void> {
  console.log(`\nSyncing ${products.length} products to Odoo...`);

  const existingCount = await client.getProductCount();
  console.log(`Current products in Odoo: ${existingCount}`);

  console.log('Checking for existing products...');
  const existingProducts = await client.getProducts([], {
    fields: ['id', 'default_code'],
    limit: 10000
  });
  const existingSkus = new Set(existingProducts.map(p => p.default_code).filter(Boolean));
  console.log(`Found ${existingSkus.size} products with SKUs in Odoo`);

  const newProducts = products.filter(p => !existingSkus.has(p.sku));
  console.log(`Products to create: ${newProducts.length} (skipping ${products.length - newProducts.length} existing)`);

  if (newProducts.length === 0) {
    console.log('All products already exist in Odoo!');
    return;
  }

  let created = 0;
  let errors = 0;
  const startTime = Date.now();

  for (let i = 0; i < newProducts.length; i += ODOO_BATCH_SIZE) {
    const batch = newProducts.slice(i, i + ODOO_BATCH_SIZE);
    const batchNum = Math.floor(i / ODOO_BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(newProducts.length / ODOO_BATCH_SIZE);

    process.stdout.write(`\rBatch ${batchNum}/${totalBatches} - Creating ${batch.length} products...`);

    for (const product of batch) {
      try {
        const odooProduct = convertProductToOdoo(product, categoryMap);
        await client.createProduct(odooProduct);
        created++;
      } catch (error) {
        errors++;
        console.error(`\nError creating product ${product.sku}:`, error);
      }
    }

    const elapsed = (Date.now() - startTime) / 1000;
    const rate = created / elapsed;
    const remaining = (newProducts.length - created - errors) / rate;
    process.stdout.write(` (${created} created, ${rate.toFixed(1)}/s, ~${remaining.toFixed(0)}s remaining)`);
  }

  console.log(`\n\nOdoo sync complete!`);
  console.log(`  Created: ${created}`);
  console.log(`  Errors: ${errors}`);
  console.log(`  Time: ${((Date.now() - startTime) / 1000).toFixed(1)}s`);
}

// ============================================
// PULL FROM ODOO FUNCTIONS
// ============================================

interface ProductFromOdoo {
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

function convertFromOdoo(odooProduct: OdooProduct, categoryMap: Map<number, string>): ProductFromOdoo {
  let categoryName = 'Unknown';
  if (Array.isArray(odooProduct.categ_id)) {
    categoryName = odooProduct.categ_id[1];
  } else if (typeof odooProduct.categ_id === 'number') {
    categoryName = categoryMap.get(odooProduct.categ_id) || 'Unknown';
  }

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

async function pullFromOdoo(client: OdooClient): Promise<ProductFromOdoo[]> {
  console.log('\nPulling products from Odoo...');

  // Get category mapping
  const categories = await client.getCategories();
  const categoryMap = new Map(categories.map(c => [c.id, c.name]));

  // Get all active products
  const odooProducts = await client.getProducts(
    [['active', '=', true]],
    { limit: 10000 }
  );

  console.log(`Retrieved ${odooProducts.length} products from Odoo`);

  return odooProducts.map(p => convertFromOdoo(p, categoryMap));
}

// ============================================
// SOLR SYNC FUNCTIONS
// ============================================

function productToSolrDoc(product: ProductFromOdoo): SolrDocument {
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
  console.log('  products.json → Odoo → Solr');
  console.log('===========================================\n');

  const client = createOdooClient();

  try {
    // PHASE 1: Sync to Odoo
    console.log('PHASE 1: Syncing products to Odoo');
    console.log('-------------------------------------------');

    console.log('Connecting to Odoo...');
    const uid = await client.authenticate();
    console.log(`Authenticated as user ID: ${uid}`);

    const categoryMap = await ensureCategories(client);
    console.log('Category mapping:', categoryMap);

    await syncToOdoo(client, generatedProducts, categoryMap);

    const odooCount = await client.getProductCount();
    console.log(`Total products in Odoo: ${odooCount}`);

    // PHASE 2: Pull from Odoo
    console.log('\n-------------------------------------------');
    console.log('PHASE 2: Pulling products from Odoo');
    console.log('-------------------------------------------');

    const productsFromOdoo = await pullFromOdoo(client);

    // PHASE 3: Sync to Solr
    console.log('\n-------------------------------------------');
    console.log('PHASE 3: Syncing products to Solr');
    console.log('-------------------------------------------');

    const solrReady = await waitForSolr();
    if (!solrReady) {
      console.error('Solr is not available. Make sure docker-compose is running.');
      process.exit(1);
    }

    const solrDocs = productsFromOdoo.map(productToSolrDoc);

    await clearSolrIndex();
    await indexToSolr(solrDocs);
    await verifySolrIndex();

    // Summary
    console.log('\n===========================================');
    console.log('  Sync Complete!');
    console.log('===========================================');
    console.log(`  Products in Odoo: ${odooCount}`);
    console.log(`  Products in Solr: ${solrDocs.length}`);
    console.log(`\nSolr Admin: http://localhost:8983/solr/#/products/query`);

  } catch (error) {
    console.error('Sync failed:', error);
    process.exit(1);
  }
}

main();
