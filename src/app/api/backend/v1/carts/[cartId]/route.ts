import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ cartId: string }> }
) {
  const { cartId } = await params;
  const authHeader = request.headers.get('authorization');
  const res = await fetch(`${API_BASE_URL}/api/3rdparty/erp?type=carts&id=${cartId}`, {
    headers: { 'Authorization': authHeader || '' }
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ cartId: string }> }
) {
  const { cartId } = await params;
  const body = await request.json();
  const authHeader = request.headers.get('authorization');
  const res = await fetch(`${API_BASE_URL}/api/3rdparty/erp?type=carts&id=${cartId}`, {
    method: 'PATCH',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': authHeader || ''
    },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
