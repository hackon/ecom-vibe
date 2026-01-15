import { NextResponse } from 'next/server';

// GET /api/3rdparty/cms/content/[slug] - generic content blocks (mocked, not used yet)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  await new Promise(resolve => setTimeout(resolve, 40)); // Simulate network delay

  const { slug } = await params;

  // Mock content blocks
  const contentBlocks: Record<string, object> = {
    'footer': {
      id: 'footer',
      type: 'footer',
      content: {
        copyright: '© 2026 Buildy McBuild. All rights reserved.',
        links: [
          { text: 'Privacy Policy', href: '/article/privacy-policy' },
          { text: 'Terms of Service', href: '/article/terms-of-service' },
          { text: 'Contact Us', href: '/article/contact' }
        ]
      }
    },
    'announcement-bar': {
      id: 'announcement-bar',
      type: 'announcement',
      content: {
        message: 'New Year Sale! Up to 30% off selected items',
        link: '/search?sale=true',
        active: true
      }
    }
  };

  const content = contentBlocks[slug];
  if (!content) {
    return NextResponse.json({ error: 'Content not found' }, { status: 404 });
  }

  return NextResponse.json({
    source: '3rdparty-cms',
    content
  });
}
