// Mock CMS State

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

const cmsData: {
  pages: HomeLayout[];
  articles: Article[];
  assets: unknown[];
  analytics: { views: number; uniqueVisitors: number; conversionRate: number };
  security: { enabled: boolean; lastAudit: string; roles: string[] };
} = {
  pages: [
    {
      id: 'home',
      slug: '/',
      title: 'Home',
      blocks: [
        {
          type: 'carousel',
          title: 'Best January Deals',
          visibleCount: 4,
          productIds: ['w0', 'w1', 'w2', 'w3', 't0', 't1', 't2', 'h0', 'h1', 'h2']
        },
        {
          type: 'hero-banner',
          title: 'Free Shipping on Orders Over $99',
          subtitle: 'Start the new year right with quality tools and materials delivered to your door.',
          backgroundColor: '#d97706',
          textColor: '#ffffff',
          link: '/article/free-shipping-policy',
          linkText: 'Learn More'
        },
        {
          type: 'carousel',
          title: 'Power Drill Offers',
          visibleCount: 4,
          productIds: ['t5', 't10', 't15', 't20', 't25', 't30', 't35']
        }
      ],
      status: 'published',
      createdAt: '2026-01-14T19:50:00Z',
      updatedAt: '2026-01-14T19:50:00Z'
    }
  ],
  articles: [
    {
      id: 'free-shipping',
      slug: 'free-shipping-policy',
      title: 'Free Shipping Policy',
      excerpt: 'Learn about our free shipping offer on orders over $99.',
      content: `## Free Shipping on Orders Over $99

At Buildy McBuild, we believe quality craftsmanship shouldn't come with hidden costs. That's why we offer **free standard shipping** on all orders over $99.

### How It Works

1. Add items to your cart totaling $99 or more
2. Proceed to checkout
3. Free shipping is automatically applied

### Shipping Times

- **Standard Shipping (Free)**: 5-7 business days
- **Express Shipping**: 2-3 business days ($14.99)
- **Next Day Delivery**: Next business day ($29.99)

### Exclusions

Some oversized items like large lumber orders may incur additional shipping fees. These will be clearly displayed at checkout.

### Questions?

Contact our support team at support@buildymcbuild.com for any shipping inquiries.`,
      status: 'published',
      createdAt: '2026-01-10T10:00:00Z',
      updatedAt: '2026-01-10T10:00:00Z'
    },
    {
      id: 'woodworking-guide',
      slug: 'beginner-woodworking-guide',
      title: 'Beginner\'s Guide to Woodworking',
      excerpt: 'Everything you need to know to start your woodworking journey.',
      content: `## Getting Started with Woodworking

Woodworking is a rewarding craft that combines creativity with practical skills. Whether you're building furniture, creating decorative pieces, or tackling home improvement projects, this guide will help you get started.

### Essential Tools for Beginners

1. **Measuring Tools**: A quality tape measure and combination square
2. **Cutting Tools**: A hand saw or circular saw
3. **Joining Tools**: Hammer, screwdriver set, and wood glue
4. **Finishing Tools**: Sandpaper (various grits) and a sanding block

### Your First Project

Start simple! A basic wooden box or shelf is perfect for beginners. It teaches fundamental skills:

- Measuring and marking
- Straight cuts
- Basic joinery
- Sanding and finishing

### Safety First

Always wear safety glasses and hearing protection when using power tools. Keep your workspace clean and well-lit.`,
      status: 'published',
      createdAt: '2026-01-05T14:00:00Z',
      updatedAt: '2026-01-12T09:30:00Z'
    }
  ],
  assets: [],
  analytics: {
    views: 1250,
    uniqueVisitors: 450,
    conversionRate: 2.5
  },
  security: {
    enabled: true,
    lastAudit: '2026-01-14T10:00:00Z',
    roles: ['admin', 'editor']
  }
};

export async function getCMSData() {
  await new Promise(resolve => setTimeout(resolve, 50));
  return cmsData;
}

export async function getHomeLayout() {
  await new Promise(resolve => setTimeout(resolve, 50));
  return cmsData.pages.find(p => p.slug === '/') || null;
}

export async function getPageBySlug(slug: string) {
  await new Promise(resolve => setTimeout(resolve, 50));
  return cmsData.pages.find(p => p.slug === slug) || null;
}

export async function getArticleBySlug(slug: string) {
  await new Promise(resolve => setTimeout(resolve, 50));
  return cmsData.articles.find(a => a.slug === slug) || null;
}

export async function getAllArticles() {
  await new Promise(resolve => setTimeout(resolve, 50));
  return cmsData.articles.filter(a => a.status === 'published');
}

export async function updatePage(id: string, updates: Record<string, unknown>) {
  await new Promise(resolve => setTimeout(resolve, 100));
  const index = cmsData.pages.findIndex(p => p.id === id);
  if (index !== -1) {
    const updatedPage = { ...cmsData.pages[index], ...updates, updatedAt: new Date().toISOString() };
    (cmsData.pages as unknown[])[index] = updatedPage;
    return updatedPage;
  }
  return null;
}

export async function createPage(page: Record<string, unknown>) {
  await new Promise(resolve => setTimeout(resolve, 100));
  const newPage = {
    ...page,
    id: Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: (page.status as string) || 'draft'
  };
  (cmsData.pages as unknown[]).push(newPage);
  return newPage;
}

export async function getAnalytics() {
  return cmsData.analytics;
}
