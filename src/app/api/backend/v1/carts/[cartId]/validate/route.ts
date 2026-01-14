import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ cartId: string }> }
) {
  const { cartId } = await params;
  const authHeader = request.headers.get('authorization');
  const res = await fetch(`${API_BASE_URL}/api/3rdparty/erp?type=cart-validate&cartId=${cartId}`, {
    method: 'POST',
    headers: { 'Authorization': authHeader || '' }
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
