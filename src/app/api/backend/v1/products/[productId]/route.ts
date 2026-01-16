import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;

  try {
    const res = await fetch(`${API_BASE_URL}/api/3rdparty/pim?ids=${productId}`);
    const data = await res.json();

    // Extract product from 3rdparty wrapper - backend acts as abstraction layer
    if (data.product) {
      return NextResponse.json(data.product, { status: res.status });
    }

    // Handle error responses
    if (data.error) {
      return NextResponse.json({ error: data.error }, { status: res.status });
    }

    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Backend product fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}
