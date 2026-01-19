/**
 * Strapi Initialization Script
 *
 * Initializes Strapi with all required content types and components.
 * This script uses the Content-Type Builder API to programmatically create:
 * - Article collection type
 * - Carousel Block collection type
 * - Hero Banner collection type
 * - Home Page single type
 *
 * Usage: npx tsx scripts/initStrapi.ts
 */

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_TOKEN;

if (!STRAPI_TOKEN) {
  console.error('❌ STRAPI_TOKEN not set in .env');
  process.exit(1);
}

interface StrapiResponse {
  data?: unknown;
  error?: {
    status: number;
    name: string;
    message: string;
    details?: unknown;
  };
}

/**
 * Make authenticated request to Strapi API
 */
async function strapiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<StrapiResponse> {
  const url = `${STRAPI_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${STRAPI_TOKEN}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    console.error(`API Error (${response.status}):`, JSON.stringify(data, null, 2));
  }

  return data;
}

/**
 * Create Article collection type
 */
async function createArticleContentType() {
  console.log('\nCreating Article collection type...');

  const contentType = {
    contentType: {
      singularName: 'article',
      pluralName: 'articles',
      displayName: 'Article',
      description: 'Blog posts and informational content',
      draftAndPublish: true,
      pluginOptions: {},
      attributes: {
        title: {
          type: 'string',
          required: true,
        },
        slug: {
          type: 'uid',
          targetField: 'title',
          required: true,
        },
        excerpt: {
          type: 'text',
        },
        content: {
          type: 'richtext',
          required: true,
        },
        image: {
          type: 'string',
        },
        status: {
          type: 'enumeration',
          enum: ['draft', 'published', 'archived'],
          default: 'draft',
          required: true,
        },
      },
    },
  };

  const result = await strapiRequest('/content-type-builder/content-types', {
    method: 'POST',
    body: JSON.stringify(contentType),
  });

  if (result.error) {
    console.error('  ✗ Failed to create Article:', result.error.message);
    return false;
  }

  console.log('  ✓ Article collection type created');
  return true;
}

/**
 * Create Carousel Block collection type
 */
async function createCarouselBlockContentType() {
  console.log('\nCreating Carousel Block collection type...');

  const contentType = {
    contentType: {
      singularName: 'carousel-block',
      pluralName: 'carousel-blocks',
      displayName: 'Carousel Block',
      description: 'Product carousel widget',
      draftAndPublish: true,
      pluginOptions: {},
      attributes: {
        title: {
          type: 'string',
          required: true,
        },
        blockType: {
          type: 'string',
          default: 'carousel',
        },
        visibleCount: {
          type: 'integer',
          default: 4,
          required: true,
        },
        productIds: {
          type: 'text',
          required: true,
        },
      },
    },
  };

  const result = await strapiRequest('/content-type-builder/content-types', {
    method: 'POST',
    body: JSON.stringify(contentType),
  });

  if (result.error) {
    console.error('  ✗ Failed to create Carousel Block:', result.error.message);
    return false;
  }

  console.log('  ✓ Carousel Block collection type created');
  return true;
}

/**
 * Create Hero Banner collection type
 */
async function createHeroBannerContentType() {
  console.log('\nCreating Hero Banner collection type...');

  const contentType = {
    contentType: {
      singularName: 'hero-banner',
      pluralName: 'hero-banners',
      displayName: 'Hero Banner',
      description: 'Hero banner widget',
      draftAndPublish: true,
      pluginOptions: {},
      attributes: {
        title: {
          type: 'string',
          required: true,
        },
        blockType: {
          type: 'string',
          default: 'hero-banner',
        },
        subtitle: {
          type: 'text',
        },
        backgroundColor: {
          type: 'string',
          default: '#d97706',
          required: true,
        },
        textColor: {
          type: 'string',
          default: '#ffffff',
          required: true,
        },
        link: {
          type: 'string',
        },
        linkText: {
          type: 'string',
        },
      },
    },
  };

  const result = await strapiRequest('/content-type-builder/content-types', {
    method: 'POST',
    body: JSON.stringify(contentType),
  });

  if (result.error) {
    console.error('  ✗ Failed to create Hero Banner:', result.error.message);
    return false;
  }

  console.log('  ✓ Hero Banner collection type created');
  return true;
}

/**
 * Create Home Page single type
 */
async function createHomePageContentType() {
  console.log('\nCreating Home Page single type...');

  const contentType = {
    contentType: {
      singularName: 'home-page',
      pluralName: 'home-pages',
      displayName: 'Home Page',
      description: 'Home page layout with content blocks',
      kind: 'singleType',
      draftAndPublish: true,
      pluginOptions: {},
      attributes: {
        title: {
          type: 'string',
          required: true,
        },
        slug: {
          type: 'string',
          default: '/',
          required: true,
        },
        blocks: {
          type: 'json',
          required: true,
        },
        status: {
          type: 'enumeration',
          enum: ['draft', 'published'],
          default: 'published',
          required: true,
        },
      },
    },
  };

  const result = await strapiRequest('/content-type-builder/content-types', {
    method: 'POST',
    body: JSON.stringify(contentType),
  });

  if (result.error) {
    console.error('  ✗ Failed to create Home Page:', result.error.message);
    return false;
  }

  console.log('  ✓ Home Page single type created');
  return true;
}

/**
 * Set permissions for public access
 */
async function setPublicPermissions() {
  console.log('\nSetting public permissions...');

  try {
    // Get the public role
    const rolesResponse = await strapiRequest('/users-permissions/roles');

    if (!rolesResponse.data || !Array.isArray(rolesResponse.data)) {
      console.error('  ✗ Failed to fetch roles');
      return false;
    }

    const publicRole = (rolesResponse.data as Array<{ type: string; id: number }>)
      .find(role => role.type === 'public');

    if (!publicRole) {
      console.error('  ✗ Public role not found');
      return false;
    }

    // Update public permissions for all content types
    const permissions = {
      permissions: {
        'api::article.article': {
          controllers: {
            article: {
              find: { enabled: true },
              findOne: { enabled: true },
            },
          },
        },
        'api::carousel-block.carousel-block': {
          controllers: {
            'carousel-block': {
              find: { enabled: true },
              findOne: { enabled: true },
            },
          },
        },
        'api::hero-banner.hero-banner': {
          controllers: {
            'hero-banner': {
              find: { enabled: true },
              findOne: { enabled: true },
            },
          },
        },
        'api::home-page.home-page': {
          controllers: {
            'home-page': {
              find: { enabled: true },
            },
          },
        },
      },
    };

    const result = await strapiRequest(`/users-permissions/roles/${publicRole.id}`, {
      method: 'PUT',
      body: JSON.stringify(permissions),
    });

    if (result.error) {
      console.error('  ✗ Failed to set permissions:', result.error.message);
      return false;
    }

    console.log('  ✓ Public permissions set for all content types');
    return true;
  } catch (error) {
    console.error('  ✗ Error setting permissions:', error);
    return false;
  }
}

/**
 * Restart Strapi server to apply changes
 */
async function restartStrapi() {
  console.log('\n⚠️  Note: Strapi needs to be restarted for content type changes to take effect.');
  console.log('Run: docker-compose restart strapi');
  console.log('Wait about 30 seconds for Strapi to fully restart.');
}

/**
 * Main execution
 */
async function main() {
  console.log('===========================================');
  console.log('  Strapi Initialization');
  console.log('  Creating content types');
  console.log('===========================================');

  // Test connection
  console.log('\nTesting connection to Strapi...');
  try {
    const response = await fetch(`${STRAPI_URL}/_health`);
    if (!response.ok) {
      throw new Error('Strapi health check failed');
    }
    console.log('✓ Connected to Strapi');
  } catch (error) {
    console.error('❌ Failed to connect to Strapi');
    console.error('Make sure Strapi is running: docker-compose up -d strapi');
    process.exit(1);
  }

  let successCount = 0;
  let failCount = 0;

  // Create content types
  console.log('\n-------------------------------------------');
  console.log('Creating Content Types');
  console.log('-------------------------------------------');

  if (await createArticleContentType()) successCount++;
  else failCount++;

  if (await createCarouselBlockContentType()) successCount++;
  else failCount++;

  if (await createHeroBannerContentType()) successCount++;
  else failCount++;

  if (await createHomePageContentType()) successCount++;
  else failCount++;

  // Set permissions
  console.log('\n-------------------------------------------');
  console.log('Setting Permissions');
  console.log('-------------------------------------------');

  if (await setPublicPermissions()) successCount++;
  else failCount++;

  // Summary
  console.log('\n===========================================');
  console.log('  Initialization Summary');
  console.log('===========================================');
  console.log(`  Success: ${successCount}`);
  console.log(`  Failed: ${failCount}`);

  if (failCount > 0) {
    console.log('\n⚠️  Some content types may already exist or there were errors.');
    console.log('You can create them manually through the Strapi admin UI:');
    console.log('  http://localhost:1337/admin/plugins/content-type-builder');
  }

  await restartStrapi();

  if (failCount === 0) {
    console.log('\n✓ Initialization complete!');
    console.log('\nNext steps:');
    console.log('  1. Restart Strapi: docker-compose restart strapi');
    console.log('  2. Wait 30 seconds');
    console.log('  3. Test connection: npm run strapi:test');
    console.log('  4. Sync data: npm run sync:strapi');
  } else {
    console.log('\n⚠️  Initialization completed with errors.');
    console.log('Please check the logs above and create missing content types manually.');
  }
}

main().catch(error => {
  console.error('\n❌ Initialization failed:', error);
  process.exit(1);
});
