import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;
  const res = await fetch(`${API_BASE_URL}/api/3rdparty/cms?type=product-stories&productId=${productId}`);
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
