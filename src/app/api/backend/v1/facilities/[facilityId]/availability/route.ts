import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ facilityId: string }> }
) {
  const { facilityId } = await params;
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');
  const query = productId ? `&productId=${productId}` : '';
  
  const res = await fetch(`${API_BASE_URL}/api/3rdparty/erp?type=availability&facilityId=${facilityId}${query}`);
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
