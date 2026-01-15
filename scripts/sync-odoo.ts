import { createOdooClient, OdooClient } from '../src/lib/odoo/client';
import { generatedProducts, Product } from '../src/lib/pim/productGenerator';

const BATCH_SIZE = 50; // Number of products to create in one batch

interface CategoryMap {
  [key: string]: number;
}

async function ensureCategories(client: OdooClient): Promise<CategoryMap> {
  console.log('Setting up product categories...');

  const categoryNames = ['Wood', 'Tools', 'Hardware'];
  const categoryMap: CategoryMap = {};

  // Get existing categories
  const existingCategories = await client.getCategories();
  const existingMap = new Map(existingCategories.map(c => [c.name, c.id]));

  // Find or get the "All" category as parent (or "Saleable")
  let parentId = existingMap.get('Saleable') || existingMap.get('All') || 1;

  for (const name of categoryNames) {
    // Check if category already exists
    const existing = existingCategories.find(c => c.name === name);
    if (existing) {
      categoryMap[name] = existing.id;
      console.log(`  Category "${name}" already exists with ID: ${existing.id}`);
    } else {
      // Create new category
      const id = await client.createCategory(name, parentId);
      categoryMap[name] = id;
      console.log(`  Created category "${name}" with ID: ${id}`);
    }
  }

  return categoryMap;
}

function convertProductToOdoo(product: Product, categoryMap: CategoryMap) {
  // Convert attributes to JSON string for storage in description
  const attributesJson = JSON.stringify(product.attributes, null, 2);

  // Build a detailed description with attributes
  const fullDescription = `${product.description}\n\n--- Attributes ---\n${attributesJson}`;

  return {
    name: product.name,
    default_code: product.sku, // Internal Reference / SKU
    list_price: product.price,
    description_sale: product.description,
    description: fullDescription,
    categ_id: categoryMap[product.category] || 1,
    type: 'product' as const, // Storable product
    sale_ok: true,
    purchase_ok: true,
    active: true,
  };
}

async function syncProducts(client: OdooClient, products: Product[], categoryMap: CategoryMap) {
  console.log(`\nSyncing ${products.length} products to Odoo...`);

  const existingCount = await client.getProductCount();
  console.log(`Current products in Odoo: ${existingCount}`);

  // Get existing products by SKU to avoid duplicates
  console.log('Checking for existing products...');
  const existingProducts = await client.getProducts([], {
    fields: ['id', 'default_code'],
    limit: 10000
  });
  const existingSkus = new Set(existingProducts.map(p => p.default_code).filter(Boolean));
  console.log(`Found ${existingSkus.size} products with SKUs in Odoo`);

  // Filter out products that already exist
  const newProducts = products.filter(p => !existingSkus.has(p.sku));
  console.log(`Products to create: ${newProducts.length} (skipping ${products.length - newProducts.length} existing)`);

  if (newProducts.length === 0) {
    console.log('All products already exist in Odoo!');
    return;
  }

  // Create products in batches
  let created = 0;
  let errors = 0;
  const startTime = Date.now();

  for (let i = 0; i < newProducts.length; i += BATCH_SIZE) {
    const batch = newProducts.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(newProducts.length / BATCH_SIZE);

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

    // Progress info
    const elapsed = (Date.now() - startTime) / 1000;
    const rate = created / elapsed;
    const remaining = (newProducts.length - created - errors) / rate;
    process.stdout.write(` (${created} created, ${rate.toFixed(1)}/s, ~${remaining.toFixed(0)}s remaining)`);
  }

  console.log(`\n\nSync complete!`);
  console.log(`  Created: ${created}`);
  console.log(`  Errors: ${errors}`);
  console.log(`  Time: ${((Date.now() - startTime) / 1000).toFixed(1)}s`);
}

async function main() {
  console.log('===========================================');
  console.log('  Odoo Product Sync');
  console.log('===========================================\n');

  const client = createOdooClient();

  try {
    // Test connection
    console.log('Connecting to Odoo...');
    const uid = await client.authenticate();
    console.log(`Authenticated as user ID: ${uid}\n`);

    // Setup categories
    const categoryMap = await ensureCategories(client);
    console.log('Category mapping:', categoryMap);

    // Sync products
    await syncProducts(client, generatedProducts, categoryMap);

    // Final count
    const finalCount = await client.getProductCount();
    console.log(`\nFinal product count in Odoo: ${finalCount}`);

  } catch (error) {
    console.error('Sync failed:', error);
    process.exit(1);
  }
}

main();
