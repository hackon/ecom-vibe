import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ids = searchParams.get('ids');

  try {
    let url = `${API_BASE_URL}/api/3rdparty/pim`;

    // Build query params for 3rdparty PIM
    if (ids) {
      url += `?ids=${encodeURIComponent(ids)}`;
    }

    const res = await fetch(url);
    const data = await res.json();

    // Extract products from 3rdparty wrapper - backend acts as abstraction layer
    if (data.products) {
      return NextResponse.json({
        products: data.products,
        count: data.count || data.products.length
      }, { status: res.status });
    }

    // Handle error responses
    if (data.error) {
      return NextResponse.json({ error: data.error }, { status: res.status });
    }

    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Backend products fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
