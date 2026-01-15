import { NextResponse } from 'next/server';
import * as pim from '@/lib/pim/odooPim';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const ids = searchParams.get('ids');
  const skus = searchParams.get('skus');

  try {
    // Get products by IDs (single id is treated as list of 1)
    if (ids || id) {
      const idList = ids
        ? ids.split(',').map(i => i.trim()).filter(Boolean)
        : [id!];
      const products = await pim.getProductsByIds(idList);

      // For single ID request, return single product format
      if (id && !ids) {
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

    // Get products by SKUs
    if (skus) {
      const skuList = skus.split(',').map(s => s.trim()).filter(Boolean);
      const products = await pim.getProductsBySku(skuList);
      return NextResponse.json({
        source: '3rdparty-pim',
        products,
        count: products.length
      });
    }

    // Get all products
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
