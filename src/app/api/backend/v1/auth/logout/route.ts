import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function POST(request: Request) {
  const body = await request.json();
  const res = await fetch(`${API_BASE_URL}/api/3rdparty/auth?action=logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json();

  // Extract from 3rdparty wrapper
  if (data.source) {
    const { source, ...rest } = data;
    return NextResponse.json(rest, { status: res.status });
  }

  return NextResponse.json(data, { status: res.status });
}
