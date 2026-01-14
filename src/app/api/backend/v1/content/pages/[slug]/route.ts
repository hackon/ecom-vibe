import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const res = await fetch(`${API_BASE_URL}/api/3rdparty/cms`);
  const data = await res.json();
  
  const page = data.pages?.find((p: { slug: string }) => p.slug === `/${slug}` || p.slug === slug);
  
  if (!page) {
    return NextResponse.json({ error: 'Page not found' }, { status: 404 });
  }
  
  return NextResponse.json(page);
}
