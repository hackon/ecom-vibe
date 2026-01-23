import { NextResponse } from 'next/server';
import { getCMSData, getHomeLayout, getArticleBySlug, getAllArticles, createPage, updatePage } from '@/lib/cms/mockCms';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const slug = searchParams.get('slug');

  // Get home layout
  if (type === 'home') {
    const layout = await getHomeLayout();
    if (!layout) {
      return NextResponse.json({ error: 'Home layout not found' }, { status: 404 });
    }
    return NextResponse.json({
      source: '3rdparty-cms',
      layout
    });
  }

  // Get article by slug
  if (type === 'article' && slug) {
    const article = await getArticleBySlug(slug);
    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }
    return NextResponse.json({
      source: '3rdparty-cms',
      article
    });
  }

  // Get all articles
  if (type === 'articles') {
    const articles = await getAllArticles();
    return NextResponse.json({
      source: '3rdparty-cms',
      articles
    });
  }

  // Default: return all CMS data
  const data = await getCMSData();
  return NextResponse.json({
    source: '3rdparty-cms',
    ...data
  });
}

export async function POST(request: Request) {
  // Simple built-in security check mimicry
  const authHeader = request.headers.get('authorization');
  if (!authHeader || authHeader !== 'Bearer mock-cms-token') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const newPage = await createPage(body);
  return NextResponse.json(newPage, { status: 201 });
}

export async function PUT(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || authHeader !== 'Bearer mock-cms-token') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
  }

  const body = await request.json();
  const updatedPage = await updatePage(id, body);
  if (!updatedPage) {
    return NextResponse.json({ error: 'Page not found' }, { status: 404 });
  }
  return NextResponse.json(updatedPage);
}
