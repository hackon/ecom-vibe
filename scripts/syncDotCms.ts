/**
 * DotCMS Sync Script
 *
 * Sets up DotCMS content types and syncs test data from mockCms.ts
 *
 * Usage: npx tsx scripts/syncDotCms.ts
 */

import { createDotCMSClient, DotCMSContent } from '../3rdParty/dotcms/client';
import { ALL_CONTENT_TYPES } from '../3rdParty/dotcms/schemas';
import { getCMSData } from '../src/lib/cms/mockCms';

// ============================================
// CONTENT TYPE SETUP
// ============================================

async function setupContentTypes() {
  console.log('\nSetting up DotCMS content types...');
  const client = createDotCMSClient();

  // Get the default site info
  console.log('  Fetching default site information...');
  const defaultSite = await client.getDefaultSite();
  console.log(`  Using site: ${defaultSite.hostname} (${defaultSite.identifier})`);

  let created = 0;
  let existing = 0;
  let errors = 0;

  for (const contentType of ALL_CONTENT_TYPES) {
    try {
      const existingType = await client.getContentTypeByVariable(contentType.variable);

      if (existingType) {
        console.log(`  ✓ Content type "${contentType.name}" already exists`);
        existing++;
      } else {
        // Add host and owner to content type
        const contentTypeWithSite = {
          ...contentType,
          host: defaultSite.identifier,
          owner: 'dotcms.org.1', // Default owner (system user)
        };

        await client.createContentType(contentTypeWithSite);
        console.log(`  ✓ Created content type "${contentType.name}"`);
        created++;
      }
    } catch (error) {
      console.error(`  ✗ Error with content type "${contentType.name}":`, error);
      errors++;
    }
  }

  console.log(`\nContent type setup complete:`);
  console.log(`  Created: ${created}`);
  console.log(`  Already existed: ${existing}`);
  console.log(`  Errors: ${errors}`);
}

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

async function syncBlocks(blocks: BlockData[]): Promise<string[]> {
  console.log('\nSyncing content blocks...');
  const client = createDotCMSClient();
  const blockIdentifiers: string[] = [];

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];

    try {
      if (block.type === 'carousel') {
        const content: DotCMSContent = {
          contentType: 'CarouselBlock',
          title: block.title,
          blockType: 'carousel',
          visibleCount: block.visibleCount,
          productIds: block.productIds.join(', '),
          languageId: 1,
        };

        const created = await client.createContent(content);
        await client.publishContent(created.identifier!);
        blockIdentifiers.push(created.identifier!);
        console.log(`  ✓ Created carousel block: "${block.title}"`);
      } else if (block.type === 'hero-banner') {
        const content: DotCMSContent = {
          contentType: 'HeroBanner',
          title: block.title,
          blockType: 'hero-banner',
          subtitle: block.subtitle,
          backgroundColor: block.backgroundColor,
          textColor: block.textColor,
          link: block.link,
          linkText: block.linkText,
          languageId: 1,
        };

        const created = await client.createContent(content);
        await client.publishContent(created.identifier!);
        blockIdentifiers.push(created.identifier!);
        console.log(`  ✓ Created hero banner: "${block.title}"`);
      }
    } catch (error) {
      console.error(`  ✗ Error creating block "${block.title}":`, error);
    }
  }

  return blockIdentifiers;
}

async function syncArticles() {
  console.log('\nSyncing articles...');
  const client = createDotCMSClient();
  const cmsData = await getCMSData();

  let created = 0;
  let errors = 0;

  for (const article of cmsData.articles) {
    try {
      // Check if article already exists
      const existing = await client.searchContent<DotCMSContent>(
        `+contentType:Article +Article.slug:${article.slug}`
      );

      if (existing.length > 0) {
        console.log(`  ⊙ Article "${article.title}" already exists`);
        continue;
      }

      const content: DotCMSContent = {
        contentType: 'Article',
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        content: article.content,
        image: article.image,
        status: article.status,
        languageId: 1,
      };

      const createdArticle = await client.createContent(content);

      if (article.status === 'published') {
        await client.publishContent(createdArticle.identifier!);
      }

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
  const client = createDotCMSClient();
  const cmsData = await getCMSData();

  const homePage = cmsData.pages.find(p => p.slug === '/');
  if (!homePage) {
    console.log('  ⚠ No home page found in mock data');
    return;
  }

  try {
    // Check if home page already exists
    const existing = await client.searchContent<DotCMSContent>(
      '+contentType:HomePage +HomePage.slug:/'
    );

    if (existing.length > 0) {
      console.log('  ⊙ Home page already exists');
      return;
    }

    // First, sync all blocks and get their identifiers
    const blockIdentifiers = await syncBlocks(homePage.blocks as BlockData[]);

    // Create home page with block references
    const content: DotCMSContent = {
      contentType: 'HomePage',
      title: homePage.title,
      slug: homePage.slug,
      blocks: JSON.stringify(blockIdentifiers),
      status: homePage.status,
      languageId: 1,
    };

    const created = await client.createContent(content);

    if (homePage.status === 'published') {
      await client.publishContent(created.identifier!);
    }

    console.log(`  ✓ Created home page with ${blockIdentifiers.length} blocks`);
  } catch (error) {
    console.error('  ✗ Error creating home page:', error);
  }
}

// ============================================
// MAIN
// ============================================

async function main() {
  console.log('===========================================');
  console.log('  DotCMS Sync');
  console.log('  Setting up content types and test data');
  console.log('===========================================');

  const client = createDotCMSClient();

  // Test connection
  console.log('\nTesting DotCMS connection...');
  const connected = await client.testConnection();

  if (!connected) {
    console.error('❌ Failed to connect to DotCMS');
    console.error('Make sure DotCMS is running and DOTCMS_API_KEY is set correctly.');
    console.error('\nTo get an API key:');
    console.error('1. Visit http://localhost:8082');
    console.error('2. Login with admin/admin');
    console.error('3. Go to System → API Tokens');
    console.error('4. Create a new token and add to .env');
    process.exit(1);
  }

  console.log('✓ Connected to DotCMS successfully');

  try {
    // Phase 1: Setup content types
    console.log('\n-------------------------------------------');
    console.log('PHASE 1: Content Type Setup');
    console.log('-------------------------------------------');
    await setupContentTypes();

    // Phase 2: Sync content
    console.log('\n-------------------------------------------');
    console.log('PHASE 2: Content Sync');
    console.log('-------------------------------------------');
    await syncArticles();
    await syncHomePage();

    // Summary
    console.log('\n===========================================');
    console.log('  DotCMS Sync Complete!');
    console.log('===========================================');
    console.log('\nDotCMS Admin: http://localhost:8082');
    console.log('Default credentials: admin / admin');
  } catch (error) {
    console.error('\n❌ Sync failed:', error);
    process.exit(1);
  }
}

main();
