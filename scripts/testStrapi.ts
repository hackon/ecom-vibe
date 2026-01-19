/**
 * Strapi Connection Test Script
 *
 * Tests connection to Strapi and verifies content types exist.
 *
 * Usage: npx tsx scripts/testStrapi.ts
 */

import { createStrapiClient } from '../3rdParty/strapi/client';

async function main() {
  console.log('===========================================');
  console.log('  Strapi Connection Test');
  console.log('===========================================\n');

  const client = createStrapiClient();

  // Test 1: Connection
  console.log('Test 1: Testing Strapi connection...');
  const connected = await client.testConnection();

  if (!connected) {
    console.error('❌ Failed to connect to Strapi');
    console.error('\nPlease check:');
    console.error('1. Strapi is running: docker-compose ps strapi');
    console.error('2. STRAPI_URL is set correctly in .env');
    console.error('3. STRAPI_TOKEN is valid');
    console.error('\nTo get an API token:');
    console.error('  - Visit http://localhost:1337/admin');
    console.error('  - Go to Settings → API Tokens');
    console.error('  - Create token with Full access');
    process.exit(1);
  }

  console.log('✓ Connected to Strapi successfully\n');

  // Test 2: Articles
  console.log('Test 2: Checking articles...');
  try {
    const articles = await client.getArticles();
    console.log(`✓ Found ${articles.length} articles`);

    if (articles.length > 0) {
      console.log('\nSample articles:');
      articles.slice(0, 3).forEach(article => {
        console.log(`  - ${article.title} (${article.slug})`);
      });
    } else {
      console.log('⚠ No articles found');
      console.log('  Run: npm run sync:strapi');
    }
  } catch (error) {
    console.error('✗ Error fetching articles:', error);
  }

  console.log('');

  // Test 3: Home Page
  console.log('Test 3: Checking home page...');
  try {
    const homePage = await client.getHomePage();

    if (homePage) {
      console.log(`✓ Found home page: "${homePage.title}"`);
      const blockRefs = JSON.parse(homePage.blocks);
      console.log(`  Blocks: ${blockRefs.length}`);
    } else {
      console.log('⚠ Home page not found');
      console.log('  Run: npm run sync:strapi');
    }
  } catch (error) {
    console.error('✗ Error fetching home page:', error);
  }

  console.log('');

  // Test 4: Carousel Blocks
  console.log('Test 4: Checking carousel blocks...');
  try {
    const blocks = await client.getCarouselBlocks();
    console.log(`✓ Found ${blocks.length} carousel blocks`);

    if (blocks.length > 0) {
      console.log('\nSample blocks:');
      blocks.slice(0, 2).forEach(block => {
        console.log(`  - ${block.title} (visible: ${block.visibleCount})`);
      });
    }
  } catch (error) {
    console.error('✗ Error fetching carousel blocks:', error);
  }

  console.log('');

  // Test 5: Hero Banners
  console.log('Test 5: Checking hero banners...');
  try {
    const banners = await client.getHeroBanners();
    console.log(`✓ Found ${banners.length} hero banners`);

    if (banners.length > 0) {
      console.log('\nSample banners:');
      banners.slice(0, 2).forEach(banner => {
        console.log(`  - ${banner.title}`);
      });
    }
  } catch (error) {
    console.error('✗ Error fetching hero banners:', error);
  }

  console.log('\n===========================================');
  console.log('  Tests Complete!');
  console.log('===========================================');
  console.log('\nStrapi Admin: http://localhost:1337/admin');
}

main();
