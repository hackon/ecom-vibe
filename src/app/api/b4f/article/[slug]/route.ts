import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// GET /api/b4f/article/[slug] - returns article by slug
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const res = await fetch(`${API_BASE_URL}/api/backend/v1/article/${slug}`);
  const data = await res.json();

  return NextResponse.json(data, { status: res.status });
}
