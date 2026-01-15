import { XmlRpcClient } from '@foxglove/xmlrpc';
import { OdooClient } from '../src/lib/odoo/client';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} environment variable is required`);
  }
  return value;
}

const ODOO_URL = requireEnv('ODOO_URL');
const ODOO_DB = requireEnv('ODOO_DB');
const ODOO_USERNAME = requireEnv('ODOO_USERNAME');
const ODOO_API_KEY = requireEnv('ODOO_API_KEY');

async function listDatabases(): Promise<string[]> {
  const dbClient = new XmlRpcClient(`${ODOO_URL}/xmlrpc/2/db`);
  try {
    const result = await dbClient.methodCall('list', []);
    return result as string[];
  } catch (error) {
    console.log('   Could not list databases (may be disabled):', error);
    return [];
  }
}

async function testOdooConnection() {
  console.log('Testing Odoo XML-RPC connection...\n');
  console.log(`URL: ${ODOO_URL}`);
  console.log(`Username: ${ODOO_USERNAME}`);
  console.log(`API Key: ${ODOO_API_KEY.substring(0, 8)}...`);
  console.log('');

  // Try to list available databases first
  console.log('0. Listing available databases...');
  const databases = await listDatabases();

  let dbToUse = ODOO_DB;
  if (databases.length > 0) {
    console.log('   Available databases:', databases);
    if (!dbToUse && databases.length === 1) {
      dbToUse = databases[0];
      console.log(`   Using database: ${dbToUse}`);
    } else if (!dbToUse) {
      dbToUse = databases[0];
      console.log(`   Using first database: ${dbToUse}`);
    }
  }

  if (!dbToUse) {
    console.log('   No database specified, trying "postgres"');
    dbToUse = 'postgres';
  }

  console.log(`\nUsing database: ${dbToUse}\n`);

  const client = new OdooClient({
    url: ODOO_URL,
    db: dbToUse,
    username: ODOO_USERNAME,
    apiKey: ODOO_API_KEY,
  });

  try {
    // Test version endpoint (no auth required)
    console.log('1. Testing version endpoint...');
    const version = await client.version();
    console.log('   Odoo version:', version);
    console.log('');

    // Test authentication
    console.log('2. Testing authentication...');
    const uid = await client.authenticate();
    console.log(`   Authenticated successfully! User ID: ${uid}`);
    console.log('');

    // Get product categories
    console.log('3. Fetching product categories...');
    const categories = await client.getCategories();
    console.log(`   Found ${categories.length} categories:`);
    categories.slice(0, 10).forEach(cat => {
      console.log(`   - [${cat.id}] ${cat.name}`);
    });
    console.log('');

    // Get existing products
    console.log('4. Fetching existing products...');
    const productCount = await client.getProductCount();
    console.log(`   Total products: ${productCount}`);

    const products = await client.getProducts([], { limit: 5 });
    if (products.length > 0) {
      console.log('   Sample products:');
      products.forEach(p => {
        const catName = Array.isArray(p.categ_id) ? p.categ_id[1] : p.categ_id;
        console.log(`   - [${p.id}] ${p.name} (SKU: ${p.default_code || 'N/A'}) - $${p.list_price} - Category: ${catName}`);
      });
    }
    console.log('');

    // Test creating a product
    console.log('5. Testing product creation...');
    const testProductId = await client.createProduct({
      name: 'Test Oak Board - DELETE ME',
      default_code: 'TEST-OAK-001',
      list_price: 49.99,
      description_sale: 'Premium Oak Board for testing - This is a test product',
      type: 'product',
      sale_ok: true,
      purchase_ok: true,
    });
    console.log(`   Created test product with ID: ${testProductId}`);

    // Read back the product
    const createdProduct = await client.getProductById(testProductId);
    console.log('   Verified product creation:', createdProduct?.name);
    console.log('');

    // Update the product
    console.log('6. Testing product update...');
    await client.updateProduct(testProductId, {
      list_price: 59.99,
      description_sale: 'Updated description - Premium Oak Board',
    });
    const updatedProduct = await client.getProductById(testProductId);
    console.log(`   Updated price: $${updatedProduct?.list_price}`);
    console.log('');

    // Delete the test product
    console.log('7. Cleaning up test product...');
    await client.deleteProduct(testProductId);
    console.log('   Test product deleted successfully');
    console.log('');

    // Get product fields to understand schema
    console.log('8. Getting product.template fields...');
    const fields = await client.fieldsGet('product.template', undefined, ['string', 'type', 'required']);
    const fieldNames = Object.keys(fields).slice(0, 20);
    console.log('   Sample fields:');
    fieldNames.forEach(name => {
      const field = fields[name] as { string?: string; type?: string; required?: boolean };
      console.log(`   - ${name}: ${field.type} (${field.string})${field.required ? ' [REQUIRED]' : ''}`);
    });
    console.log('');

    console.log('✅ All tests passed! Odoo connection is working correctly.');
    console.log(`\nRecommended environment variables:`);
    console.log(`  ODOO_URL=${ODOO_URL}`);
    console.log(`  ODOO_DB=${dbToUse}`);
    console.log(`  ODOO_USERNAME=${ODOO_USERNAME}`);
    console.log(`  ODOO_API_KEY=${ODOO_API_KEY}`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testOdooConnection();
