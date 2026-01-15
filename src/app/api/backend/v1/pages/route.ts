import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// GET /api/backend/v1/pages - returns home page layout
export async function GET() {
  const res = await fetch(`${API_BASE_URL}/api/3rdparty/cms/pages`);
  const data = await res.json();

  // Extract page from 3rdparty wrapper
  if (data.page) {
    return NextResponse.json(data.page, { status: res.status });
  }

  return NextResponse.json(data, { status: res.status });
}
