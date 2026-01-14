import { NextResponse } from 'next/server';
import { getCMSData, createPage, updatePage } from '@/lib/cms/mockCms';

export async function GET() {
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
