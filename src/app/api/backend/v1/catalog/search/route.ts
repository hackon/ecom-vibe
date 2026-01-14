import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.toString();
  const res = await fetch(`${API_BASE_URL}/api/3rdparty/pim?type=search${query ? `&${query}` : ''}`);
  const data = await res.json();
  return NextResponse.json(data);
}
