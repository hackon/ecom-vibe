import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// GET /api/backend/v1/article/[slug] - returns article by slug
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const res = await fetch(`${API_BASE_URL}/api/3rdparty/cms/article/${slug}`);
  const data = await res.json();

  // Extract article from 3rdparty wrapper
  if (data.article) {
    return NextResponse.json(data.article, { status: res.status });
  }

  return NextResponse.json(data, { status: res.status });
}
