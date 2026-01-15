import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');

  if (!authHeader) {
    return NextResponse.json({ error: 'No token provided' }, { status: 401 });
  }

  const res = await fetch(`${API_BASE_URL}/api/3rdparty/auth?type=me`, {
    headers: { 'Authorization': authHeader }
  });
  const data = await res.json();

  // Extract user from 3rdparty wrapper
  if (data.user) {
    return NextResponse.json(data.user, { status: res.status });
  }

  // Extract from 3rdparty wrapper for errors
  if (data.source) {
    const { source, ...rest } = data;
    return NextResponse.json(rest, { status: res.status });
  }

  return NextResponse.json(data, { status: res.status });
}
