/**
 * Strapi Sync Script
 *
 * Syncs test data from mockCms.ts to Strapi
 *
 * Usage: npx tsx scripts/syncStrapi.ts
 */

import { createStrapiClient } from '../3rdParty/strapi/client';
import { getCMSData } from '../src/lib/cms/mockCms';

// ============================================
// CONTENT SYNC
// ============================================

interface CarouselBlockData {
  type: 'carousel';
  title: string;
  visibleCount: number;
  productIds: string[];
}

interface HeroBannerData {
  type: 'hero-banner';
  title: string;
  subtitle: string;
  backgroundColor: string;
  textColor: string;
  link: string;
  linkText: string;
}

type BlockData = CarouselBlockData | HeroBannerData;

interface BlockReference {
  type: 'carousel' | 'hero-banner';
  id: string;
}

async function syncBlocks(blocks: BlockData[]): Promise<BlockReference[]> {
  console.log('\nSyncing content blocks...');
  const client = createStrapiClient();
  const blockReferences: BlockReference[] = [];

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];

    try {
      if (block.type === 'carousel') {
        const created = await client.createCarouselBlock({
          title: block.title,
          blockType: 'carousel',
          visibleCount: block.visibleCount,
          productIds: block.productIds.join(', '),
        });

        blockReferences.push({
          type: 'carousel',
          id: created.documentId,
        });
        console.log(`  ✓ Created carousel block: "${block.title}"`);
      } else if (block.type === 'hero-banner') {
        const created = await client.createHeroBanner({
          title: block.title,
          blockType: 'hero-banner',
          subtitle: block.subtitle,
          backgroundColor: block.backgroundColor,
          textColor: block.textColor,
          link: block.link,
          linkText: block.linkText,
        });

        blockReferences.push({
          type: 'hero-banner',
          id: created.documentId,
        });
        console.log(`  ✓ Created hero banner: "${block.title}"`);
      }
    } catch (error) {
      console.error(`  ✗ Error creating block "${block.title}":`, error);
    }
  }

  return blockReferences;
}

async function syncArticles() {
  console.log('\nSyncing articles...');
  const client = createStrapiClient();
  const cmsData = await getCMSData();

  let created = 0;
  let errors = 0;

  for (const article of cmsData.articles) {
    try {
      // Check if article already exists
      const existing = await client.getArticleBySlug(article.slug);

      if (existing) {
        console.log(`  ⊙ Article "${article.title}" already exists`);
        continue;
      }

      await client.createArticle({
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        content: article.content,
        image: article.image,
        status: article.status as 'draft' | 'published' | 'archived',
      });

      console.log(`  ✓ Created article: "${article.title}"`);
      created++;
    } catch (error) {
      console.error(`  ✗ Error creating article "${article.title}":`, error);
      errors++;
    }
  }

  console.log(`\nArticle sync complete:`);
  console.log(`  Created: ${created}`);
  console.log(`  Errors: ${errors}`);
}

async function syncHomePage() {
  console.log('\nSyncing home page...');
  const client = createStrapiClient();
  const cmsData = await getCMSData();

  const homePage = cmsData.pages.find(p => p.slug === '/');
  if (!homePage) {
    console.log('  ⚠ No home page found in mock data');
    return;
  }

  try {
    // Check if home page already exists
    const existing = await client.getHomePage();

    if (existing) {
      console.log('  ⊙ Home page already exists');
      return;
    }

    // First, sync all blocks and get their references
    const blockReferences = await syncBlocks(homePage.blocks as BlockData[]);

    // Create home page with block references
    await client.createHomePage({
      title: homePage.title,
      slug: homePage.slug,
      blocks: JSON.stringify(blockReferences),
      status: homePage.status as 'draft' | 'published',
    });

    console.log(`  ✓ Created home page with ${blockReferences.length} blocks`);
  } catch (error) {
    console.error('  ✗ Error creating home page:', error);
  }
}

// ============================================
// MAIN
// ============================================

async function main() {
  console.log('===========================================');
  console.log('  Strapi Sync');
  console.log('  Syncing test data to Strapi');
  console.log('===========================================');

  const client = createStrapiClient();

  // Test connection
  console.log('\nTesting Strapi connection...');
  const connected = await client.testConnection();

  if (!connected) {
    console.error('❌ Failed to connect to Strapi');
    console.error('Make sure Strapi is running and STRAPI_TOKEN is set correctly.');
    console.error('\nTo get an API token:');
    console.error('1. Visit http://localhost:1337/admin');
    console.error('2. Go to Settings → API Tokens');
    console.error('3. Create a new token with Full access');
    console.error('4. Add to .env');
    process.exit(1);
  }

  console.log('✓ Connected to Strapi successfully');

  try {
    // Phase 1: Sync content
    console.log('\n-------------------------------------------');
    console.log('PHASE 1: Content Sync');
    console.log('-------------------------------------------');
    await syncArticles();
    await syncHomePage();

    // Summary
    console.log('\n===========================================');
    console.log('  Strapi Sync Complete!');
    console.log('===========================================');
    console.log('\nStrapi Admin: http://localhost:1337/admin');
  } catch (error) {
    console.error('\n❌ Sync failed:', error);
    process.exit(1);
  }
}

main();
