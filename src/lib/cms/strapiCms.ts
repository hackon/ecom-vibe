/**
 * Strapi CMS Backend Wrapper
 *
 * Backend layer for CMS functionality using Strapi.
 * Provides the same interface as mockCms.ts for seamless transition.
 */

import { createStrapiClient } from '../../../3rdParty/strapi/client';
import type { StrapiCarouselBlock, StrapiHeroBanner } from '../../../3rdParty/strapi/client';

// Layout block types
interface CarouselBlock {
  type: 'carousel';
  title: string;
  visibleCount: number;
  productIds: string[];
}

interface HeroBannerBlock {
  type: 'hero-banner';
  title: string;
  subtitle: string;
  backgroundColor: string;
  textColor: string;
  link: string;
  linkText: string;
}

type LayoutBlock = CarouselBlock | HeroBannerBlock;

interface HomeLayout {
  id: string;
  slug: string;
  title: string;
  blocks: LayoutBlock[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface Article {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  image?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const USE_STRAPI = process.env.STRAPI_TOKEN ? true : false;

/**
 * Fetch a block (carousel or hero banner) from Strapi
 */
async function fetchBlock(documentId: string, blockType: 'carousel' | 'hero-banner'): Promise<LayoutBlock | null> {
  const client = createStrapiClient();

  try {
    if (blockType === 'carousel') {
      const content = await client.getCarouselBlock(documentId);
      if (!content) return null;

      return {
        type: 'carousel',
        title: content.title,
        visibleCount: content.visibleCount,
        productIds: content.productIds.split(',').map(id => id.trim()),
      };
    } else if (blockType === 'hero-banner') {
      const content = await client.getHeroBanner(documentId);
      if (!content) return null;

      return {
        type: 'hero-banner',
        title: content.title,
        subtitle: content.subtitle || '',
        backgroundColor: content.backgroundColor,
        textColor: content.textColor,
        link: content.link || '',
        linkText: content.linkText || '',
      };
    }
  } catch (error) {
    console.error(`Error fetching block ${documentId}:`, error);
  }

  return null;
}

/**
 * Get home page layout from Strapi
 */
export async function getHomeLayout(): Promise<HomeLayout | null> {
  if (!USE_STRAPI) {
    // Fallback to mock CMS
    const { getHomeLayout: getMockHomeLayout } = await import('./mockCms');
    return getMockHomeLayout();
  }

  try {
    const client = createStrapiClient();

    // Get home page
    const homePage = await client.getHomePage();

    if (!homePage) {
      console.warn('Home page not found in Strapi, falling back to mock');
      const { getHomeLayout: getMockHomeLayout } = await import('./mockCms');
      return getMockHomeLayout();
    }

    // Parse block references: [{ type: 'carousel', id: 'doc123' }, ...]
    interface BlockReference {
      type: 'carousel' | 'hero-banner';
      id: string;
    }
    const blockReferences: BlockReference[] = JSON.parse(homePage.blocks);

    // Fetch all blocks
    const blocks: LayoutBlock[] = [];
    for (const blockRef of blockReferences) {
      const block = await fetchBlock(blockRef.id, blockRef.type);
      if (block) {
        blocks.push(block);
      }
    }

    return {
      id: homePage.documentId,
      slug: '/',
      title: homePage.title,
      blocks,
      status: homePage.status,
      createdAt: homePage.createdAt,
      updatedAt: homePage.updatedAt,
    };
  } catch (error) {
    console.error('Error fetching home layout from Strapi:', error);
    const { getHomeLayout: getMockHomeLayout } = await import('./mockCms');
    return getMockHomeLayout();
  }
}

/**
 * Get article by slug from Strapi
 */
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  if (!USE_STRAPI) {
    const { getArticleBySlug: getMockArticle } = await import('./mockCms');
    return getMockArticle(slug);
  }

  try {
    const client = createStrapiClient();
    const article = await client.getArticleBySlug(slug);

    if (!article) {
      return null;
    }

    return {
      id: article.documentId,
      slug: article.slug,
      title: article.title,
      content: article.content,
      excerpt: article.excerpt || '',
      image: article.image,
      status: article.status,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
    };
  } catch (error) {
    console.error('Error fetching article from Strapi:', error);
    return null;
  }
}

/**
 * Get all published articles from Strapi
 */
export async function getAllArticles(): Promise<Article[]> {
  if (!USE_STRAPI) {
    const { getAllArticles: getMockArticles } = await import('./mockCms');
    return getMockArticles();
  }

  try {
    const client = createStrapiClient();
    const articles = await client.getArticles();

    return articles
      .filter(article => article.status === 'published')
      .map(article => ({
        id: article.documentId,
        slug: article.slug,
        title: article.title,
        content: article.content,
        excerpt: article.excerpt || '',
        image: article.image,
        status: article.status,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
      }));
  } catch (error) {
    console.error('Error fetching articles from Strapi:', error);
    const { getAllArticles: getMockArticles } = await import('./mockCms');
    return getMockArticles();
  }
}

/**
 * Get page by slug from Strapi
 */
export async function getPageBySlug(slug: string): Promise<HomeLayout | null> {
  if (!USE_STRAPI) {
    const { getPageBySlug: getMockPage } = await import('./mockCms');
    return getMockPage(slug);
  }

  if (slug === '/') {
    return getHomeLayout();
  }

  // For other pages, implement as needed
  return null;
}

/**
 * Get CMS analytics (placeholder - Strapi doesn't provide this directly)
 */
export async function getAnalytics() {
  const { getAnalytics: getMockAnalytics } = await import('./mockCms');
  return getMockAnalytics();
}

/**
 * Get full CMS data (for admin/debugging)
 */
export async function getCMSData() {
  if (!USE_STRAPI) {
    const { getCMSData: getMockCMSData } = await import('./mockCms');
    return getMockCMSData();
  }

  const homePage = await getHomeLayout();
  const articles = await getAllArticles();

  return {
    pages: homePage ? [homePage] : [],
    articles,
    assets: [],
    analytics: await getAnalytics(),
    security: {
      enabled: true,
      lastAudit: new Date().toISOString(),
      roles: ['admin', 'editor'],
    },
  };
}
