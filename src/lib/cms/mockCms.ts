// Mock CMS State
const cmsData = {
  pages: [
    {
      id: 'landing-page',
      slug: '/',
      title: 'Welcome to Buildy McBuild',
      content: {
        hero: {
          title: 'Welcome to Buildy McBuild',
          subtitle: 'Your one-stop shop for premium carpentry and woodworking supplies.'
        },
        categories: [
          {
            title: 'Hardwoods',
            description: 'Oak, Walnut, Cherry, and more premium cuts for your finest projects.',
            buttonText: 'Browse Wood'
          },
          {
            title: 'Precision Tools',
            description: 'Chisels, planes, and saws from the world\'s most trusted brands.',
            buttonText: 'View Tools'
          },
          {
            title: 'Hardware',
            description: 'Hinges, pulls, and finishes to give your work the perfect final touch.',
            buttonText: 'Shop Hardware'
          }
        ],
        footer: {
          text: 'Start Your Next Project Today',
          subtext: 'Quality materials for craftsmen who care about their work.'
        }
      },
      status: 'published',
      createdAt: '2026-01-14T19:50:00Z',
      updatedAt: '2026-01-14T19:50:00Z'
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
