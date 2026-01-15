import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // Forward all query params to the 3rdparty search API
  const res = await fetch(`${API_BASE_URL}/api/3rdparty/search?${searchParams.toString()}`);
  const data = await res.json();

  // If search service is unavailable, return appropriate error
  if (!res.ok) {
    return NextResponse.json(
      {
        error: 'Search service unavailable',
        message: data.message || 'Please try again later',
      },
      { status: res.status }
    );
  }

  return NextResponse.json(data);
}

// Autocomplete endpoint
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const res = await fetch(`${API_BASE_URL}/api/3rdparty/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: 'Autocomplete service unavailable', suggestions: [] },
      { status: 503 }
    );
  }
}
