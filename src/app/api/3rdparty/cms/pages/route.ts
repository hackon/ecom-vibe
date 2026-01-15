import { NextResponse } from 'next/server';
import { getHomeLayout } from '@/lib/cms/mockCms';

// GET /api/3rdparty/cms/pages - returns home/index page layout
export async function GET() {
  await new Promise(resolve => setTimeout(resolve, 60)); // Simulate network delay

  const layout = await getHomeLayout();
  if (!layout) {
    return NextResponse.json({ error: 'Page not found' }, { status: 404 });
  }

  return NextResponse.json({
    source: '3rdparty-cms',
    page: layout
  });
}
