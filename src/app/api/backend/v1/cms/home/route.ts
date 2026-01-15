import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function GET() {
  const res = await fetch(`${API_BASE_URL}/api/3rdparty/cms?type=home`);
  const data = await res.json();

  // Extract layout from 3rdparty wrapper
  if (data.layout) {
    return NextResponse.json(data.layout, { status: res.status });
  }

  return NextResponse.json(data, { status: res.status });
}
