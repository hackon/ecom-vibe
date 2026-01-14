import { NextResponse } from 'next/server';
import { getProducts, getProductById, addProduct, updateProduct } from '@/lib/pim/mockPim';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (id) {
    const product = await getProductById(id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json({
      source: '3rdparty-pim',
      product
    });
  }

  const products = await getProducts();
  return NextResponse.json({
    source: '3rdparty-pim',
    products
  });
}

export async function POST(request: Request) {
  // Simple built-in security check mimicry
  const authHeader = request.headers.get('authorization');
  if (!authHeader || authHeader !== 'Bearer mock-pim-token') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const newProduct = await addProduct(body);
    return NextResponse.json(newProduct, { status: 201 });
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
    const updatedProduct = await updateProduct(id, body);
    if (!updatedProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json(updatedProduct);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
}
