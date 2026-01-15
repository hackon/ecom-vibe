import { NextResponse } from 'next/server';
import { getArticleBySlug } from '@/lib/cms/mockCms';

// GET /api/3rdparty/cms/article/[slug] - returns article by slug
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  await new Promise(resolve => setTimeout(resolve, 50)); // Simulate network delay

  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return NextResponse.json({ error: 'Article not found' }, { status: 404 });
  }

  return NextResponse.json({
    source: '3rdparty-cms',
    article
  });
}
