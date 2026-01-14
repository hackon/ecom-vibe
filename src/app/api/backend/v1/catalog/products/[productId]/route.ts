import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;
  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get('customerId');

  const [pimRes, erpRes] = await Promise.all([
    fetch(`${API_BASE_URL}/api/3rdparty/pim?id=${productId}`),
    fetch(`${API_BASE_URL}/api/3rdparty/erp?type=price&productId=${productId}${customerId ? `&customerId=${customerId}` : ''}`)
  ]);

  const product = await pimRes.json();
  const pricing = await erpRes.json();

  if (product.error) return NextResponse.json(product, { status: 404 });

  return NextResponse.json({
    ...product,
    pricing: pricing.error ? null : pricing
  });
}
