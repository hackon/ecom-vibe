import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function GET() {
  const res = await fetch(`${API_BASE_URL}/api/3rdparty/pim?type=categories`);
  const data = await res.json();
  return NextResponse.json(data);
}
