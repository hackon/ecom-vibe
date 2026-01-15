/**
 * Sync products from PIM to Solr
 *
 * Usage: npx tsx scripts/sync-solr.ts
 */

import productsData from '../src/data/products.json';

const SOLR_URL = process.env.SOLR_URL || 'http://localhost:8983/solr/products';

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

function productToSolrDoc(product: typeof productsData[0]): SolrDocument {
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
  console.log('Waiting for Solr to be ready...');

  for (let i = 0; i < maxRetries; i++) {
    try {
      // Use select endpoint instead of ping - more reliable
      const response = await fetch(`${SOLR_URL}/select?q=*:*&rows=0&wt=json`);
      if (response.ok) {
        console.log('Solr is ready!');
        return true;
      }
      console.log(`Response status: ${response.status}`);
    } catch (error) {
      // Solr not ready yet
      console.log(`Connection error: ${error instanceof Error ? error.message : 'unknown'}`);
    }
    console.log(`Attempt ${i + 1}/${maxRetries} - Solr not ready, waiting ${delayMs}ms...`);
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }

  return false;
}

async function clearIndex(): Promise<void> {
  console.log('Clearing existing index...');
  const response = await fetch(`${SOLR_URL}/update?commit=true`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ delete: { query: '*:*' } }),
  });

  if (!response.ok) {
    throw new Error(`Failed to clear index: ${response.statusText}`);
  }
  console.log('Index cleared.');
}

async function indexProducts(products: SolrDocument[], batchSize = 100): Promise<void> {
  console.log(`Indexing ${products.length} products in batches of ${batchSize}...`);

  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);

    const response = await fetch(`${SOLR_URL}/update?commit=true`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(batch),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to index batch ${i / batchSize + 1}: ${errorText}`);
    }

    console.log(`Indexed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(products.length / batchSize)}`);
  }

  console.log('All products indexed successfully!');
}

async function verifyIndex(): Promise<void> {
  console.log('Verifying index...');
  const response = await fetch(`${SOLR_URL}/select?q=*:*&rows=0&wt=json`);
  const data = await response.json();
  console.log(`Total documents in index: ${data.response.numFound}`);

  // Test facets
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

async function main() {
  try {
    // Wait for Solr to be available
    const solrReady = await waitForSolr();
    if (!solrReady) {
      console.error('Solr is not available. Make sure docker-compose is running.');
      process.exit(1);
    }

    // Convert products to Solr documents
    const solrDocs = productsData.map(productToSolrDoc);

    // Clear and reindex
    await clearIndex();
    await indexProducts(solrDocs);
    await verifyIndex();

    console.log('\nSync complete!');
    console.log(`You can browse Solr at: http://localhost:8983/solr/#/products/query`);

  } catch (error) {
    console.error('Sync failed:', error);
    process.exit(1);
  }
}

main();
