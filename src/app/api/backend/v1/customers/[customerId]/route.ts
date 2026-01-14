import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ customerId: string }> }
) {
  const { customerId } = await params;
  const res = await fetch(`${API_BASE_URL}/api/3rdparty/crm?type=customers&id=${customerId}`);
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ customerId: string }> }
) {
  const { customerId } = await params;
  const body = await request.json();
  const res = await fetch(`${API_BASE_URL}/api/3rdparty/crm?type=customers&id=${customerId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
