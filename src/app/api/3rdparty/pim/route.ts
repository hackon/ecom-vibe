import { NextResponse } from 'next/server';
import * as pim from '@/lib/pim/externalPim';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ids = searchParams.get('ids');

  try {
    // Get products by IDs (comma-separated)
    if (ids) {
      const idList = ids.split(',').map(i => i.trim()).filter(Boolean);

      if (idList.length === 0) {
        return NextResponse.json({
          source: '3rdparty-pim',
          products: [],
          count: 0
        });
      }

      const products = await pim.getProductsByIds(idList);

      console.log(products)
      // For single ID request, return single product format
      if (idList.length === 1) {
        if (products.length === 0) {
          return NextResponse.json({
            source: '3rdparty-pim',
            error: 'Product not found'
          }, { status: 404 });
        }
        return NextResponse.json({
          source: '3rdparty-pim',
          product: products[0]
        });
      }

      return NextResponse.json({
        source: '3rdparty-pim',
        products,
        count: products.length
      });
    }

    // Get all products (no filter)
    const products = await pim.getProducts();
    return NextResponse.json({
      source: '3rdparty-pim',
      products,
      count: products.length
    });
  } catch (error) {
    console.error('PIM error:', error);
    return NextResponse.json({
      source: '3rdparty-pim',
      error: 'Failed to fetch from PIM',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
