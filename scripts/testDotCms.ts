/**
 * DotCMS Connection Test Script
 *
 * Tests connection to DotCMS and verifies setup.
 *
 * Usage: npx tsx scripts/testDotCms.ts
 */

import { createDotCMSClient } from '../3rdParty/dotcms/client';

async function main() {
  console.log('===========================================');
  console.log('  DotCMS Connection Test');
  console.log('===========================================\n');

  const client = createDotCMSClient();

  // Test 1: Connection
  console.log('Test 1: Testing connection...');
  const connected = await client.testConnection();

  if (!connected) {
    console.error('❌ Failed to connect to DotCMS');
    console.error('\nTroubleshooting:');
    console.error('1. Make sure Docker is running: docker ps');
    console.error('2. Make sure DotCMS container is healthy: docker-compose ps dotcms');
    console.error('3. Check DotCMS logs: docker-compose logs dotcms');
    console.error('4. Verify DOTCMS_URL in .env (default: http://localhost:8082)');
    console.error('5. Get API key from http://localhost:8082 → System → API Tokens');
    console.error('6. Add API key to .env as DOTCMS_API_KEY');
    process.exit(1);
  }

  console.log('✓ Connected to DotCMS successfully\n');

  // Test 2: Content Types
  console.log('Test 2: Checking content types...');
  try {
    const contentTypes = await client.getContentTypes();
    console.log(`✓ Found ${contentTypes.length} content types`);
    for (let i = 0; i < contentTypes.length; i++) {
      const ct = contentTypes[i];
      // console.log(ct)
    
    }

    const ourTypes = ['Video', 'webPageContent', 'Image', 'htmlpageasset'];
    const existingTypes = contentTypes.filter(ct =>
      ourTypes.includes(ct.variable)
    );

    if (existingTypes.length === 0) {
      console.log('⚠ E-commerce content types not found');
      console.log('  Run: npm run sync:dotcms');
    } else {
      console.log(`✓ Found ${existingTypes.length}/${ourTypes.length} e-commerce content types:`);
      existingTypes.forEach(ct => {
        console.log(`  - ${ct.name} (${ct.variable})`);
      });
    }
  } catch (error) {
    console.error('❌ Error checking content types:', error);
  }

  console.log('');

  // Test 3: Content
  console.log('Test 3: Checking content...');
  try {
    const articles = await client.searchContent(
      '+contentType:Article +working:true',
      10
    );
    console.log(`✓ Found ${articles.length} articles`);

    const homePages = await client.searchContent(
      '+contentType:HomePage +working:true',
      10
    );
    console.log(`✓ Found ${homePages.length} home pages`);

    if (articles.length === 0 && homePages.length === 0) {
      console.log('⚠ No content found');
      console.log('  Run: npm run sync:dotcms');
    }
  } catch (error) {
    console.error('❌ Error checking content:', error);
  }

  console.log('');

  // Summary
  console.log('===========================================');
  console.log('  Test Complete!');
  console.log('===========================================');
  console.log('\nNext steps:');
  console.log('1. If content types are missing: npm run sync:dotcms');
  console.log('2. Access DotCMS: http://localhost:8082');
  console.log('3. Default credentials: admin / admin');
}

main();
