/**
 * DotCMS Backend Wrapper
 *
 * Backend layer for CMS functionality using DotCMS.
 * Provides the same interface as mockCms.ts for seamless transition.
 */

import { createDotCMSClient, DotCMSContent } from '../../../3rdParty/dotcms/client';

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

const USE_DOTCMS = process.env.DOTCMS_API_KEY ? true : false;

/**
 * Fetch a block (carousel or hero banner) from DotCMS
 */
async function fetchBlock(identifier: string): Promise<LayoutBlock | null> {
  const client = createDotCMSClient();
  const content = await client.getContent<DotCMSContent>(identifier);

  if (!content) return null;

  const blockType = content.blockType as string;

  if (blockType === 'carousel') {
    const productIdsStr = content.productIds as string;
    return {
      type: 'carousel',
      title: content.title as string,
      visibleCount: Number(content.visibleCount),
      productIds: productIdsStr.split(',').map(id => id.trim()),
    };
  } else if (blockType === 'hero-banner') {
    return {
      type: 'hero-banner',
      title: content.title as string,
      subtitle: content.subtitle as string,
      backgroundColor: content.backgroundColor as string,
      textColor: content.textColor as string,
      link: content.link as string,
      linkText: content.linkText as string,
    };
  }

  return null;
}

/**
 * Get home page layout from DotCMS
 */
export async function getHomeLayout(): Promise<HomeLayout | null> {
  if (!USE_DOTCMS) {
    // Fallback to mock CMS
    const { getHomeLayout: getMockHomeLayout } = await import('./mockCms');
    return getMockHomeLayout();
  }

  try {
    const client = createDotCMSClient();

    // Search for home page
    const results = await client.searchContent<DotCMSContent>(
      '+contentType:HomePage +HomePage.slug:/ +working:true'
    );

    if (results.length === 0) {
      console.warn('Home page not found in DotCMS, falling back to mock');
      const { getHomeLayout: getMockHomeLayout } = await import('./mockCms');
      return getMockHomeLayout();
    }

    const homePage = results[0];

    // Parse block identifiers
    const blockIdentifiers: string[] = JSON.parse(homePage.blocks as string);

    // Fetch all blocks
    const blocks: LayoutBlock[] = [];
    for (const identifier of blockIdentifiers) {
      const block = await fetchBlock(identifier);
      if (block) {
        blocks.push(block);
      }
    }

    return {
      id: homePage.identifier!,
      slug: '/',
      title: homePage.title as string,
      blocks,
      status: homePage.status as string,
      createdAt: (homePage.modDate as string) || new Date().toISOString(),
      updatedAt: (homePage.modDate as string) || new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching home layout from DotCMS:', error);
    const { getHomeLayout: getMockHomeLayout } = await import('./mockCms');
    return getMockHomeLayout();
  }
}

/**
 * Get article by slug from DotCMS
 */
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  if (!USE_DOTCMS) {
    const { getArticleBySlug: getMockArticle } = await import('./mockCms');
    return getMockArticle(slug);
  }

  try {
    const client = createDotCMSClient();

    const results = await client.searchContent<DotCMSContent>(
      `+contentType:Article +Article.slug:${slug} +working:true`
    );

    if (results.length === 0) {
      return null;
    }

    const article = results[0];

    return {
      id: article.identifier!,
      slug: article.slug as string,
      title: article.title as string,
      content: article.content as string,
      excerpt: (article.excerpt as string) || '',
      image: article.image as string | undefined,
      status: article.status as string,
      createdAt: (article.modDate as string) || new Date().toISOString(),
      updatedAt: (article.modDate as string) || new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching article from DotCMS:', error);
    return null;
  }
}

/**
 * Get all published articles from DotCMS
 */
export async function getAllArticles(): Promise<Article[]> {
  if (!USE_DOTCMS) {
    const { getAllArticles: getMockArticles } = await import('./mockCms');
    return getMockArticles();
  }

  try {
    const client = createDotCMSClient();

    const results = await client.searchContent<DotCMSContent>(
      '+contentType:Article +Article.status:published +working:true',
      1000
    );

    return results.map(article => ({
      id: article.identifier!,
      slug: article.slug as string,
      title: article.title as string,
      content: article.content as string,
      excerpt: (article.excerpt as string) || '',
      image: article.image as string | undefined,
      status: article.status as string,
      createdAt: (article.modDate as string) || new Date().toISOString(),
      updatedAt: (article.modDate as string) || new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Error fetching articles from DotCMS:', error);
    const { getAllArticles: getMockArticles } = await import('./mockCms');
    return getMockArticles();
  }
}

/**
 * Get page by slug from DotCMS
 */
export async function getPageBySlug(slug: string): Promise<HomeLayout | null> {
  if (!USE_DOTCMS) {
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
 * Get CMS analytics (placeholder - DotCMS doesn't provide this directly)
 */
export async function getAnalytics() {
  const { getAnalytics: getMockAnalytics } = await import('./mockCms');
  return getMockAnalytics();
}

/**
 * Get full CMS data (for admin/debugging)
 */
export async function getCMSData() {
  if (!USE_DOTCMS) {
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
