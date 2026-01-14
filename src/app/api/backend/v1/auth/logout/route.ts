import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  const res = await fetch(`${API_BASE_URL}/api/3rdparty/auth?type=logout`, {
    method: 'POST',
    headers: { 'Authorization': authHeader || '' }
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
