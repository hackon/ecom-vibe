import { NextResponse } from 'next/server';
// Use Odoo PIM instead of mock PIM
import * as odooPim from '@/lib/pim/odooPim';
// Keep mock PIM available as fallback
import * as mockPim from '@/lib/pim/mockPim';

// Environment variable to switch between Odoo and mock PIM
const USE_ODOO = process.env.USE_ODOO_PIM !== 'false'; // Default to Odoo

const pim = USE_ODOO ? odooPim : mockPim;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const sku = searchParams.get('sku');

  try {
    // Get product by SKU
    if (sku && 'getProductBySku' in pim) {
      const product = await (pim as typeof odooPim).getProductBySku(sku);
      if (!product) {
        return NextResponse.json({
          source: '3rdparty-pim',
          error: 'Product not found'
        }, { status: 404 });
      }
      return NextResponse.json({
        source: '3rdparty-pim',
        backend: USE_ODOO ? 'odoo' : 'mock',
        product
      });
    }

    // Get product by ID
    if (id) {
      const product = await pim.getProductById(id);
      if (!product) {
        return NextResponse.json({
          source: '3rdparty-pim',
          error: 'Product not found'
        }, { status: 404 });
      }
      return NextResponse.json({
        source: '3rdparty-pim',
        backend: USE_ODOO ? 'odoo' : 'mock',
        product
      });
    }

    // Get all products
    const products = await pim.getProducts();
    return NextResponse.json({
      source: '3rdparty-pim',
      backend: USE_ODOO ? 'odoo' : 'mock',
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

export async function POST(request: Request) {
  // Simple built-in security check mimicry
  const authHeader = request.headers.get('authorization');
  if (!authHeader || authHeader !== 'Bearer mock-pim-token') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Only mock PIM supports adding products
    if (!USE_ODOO) {
      const newProduct = await mockPim.addProduct(body);
      return NextResponse.json(newProduct, { status: 201 });
    }

    return NextResponse.json({
      error: 'Product creation not supported for Odoo PIM via this endpoint'
    }, { status: 501 });
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || authHeader !== 'Bearer mock-pim-token') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
  }

  try {
    const body = await request.json();

    // Only mock PIM supports updating products
    if (!USE_ODOO) {
      const updatedProduct = await mockPim.updateProduct(id, body);
      if (!updatedProduct) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }
      return NextResponse.json(updatedProduct);
    }

    return NextResponse.json({
      error: 'Product update not supported for Odoo PIM via this endpoint'
    }, { status: 501 });
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
}
