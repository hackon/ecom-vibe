import { NextResponse } from 'next/server';
import { getFacilities, getOrders, getOrderById, createOrder, getPrice } from '@/lib/erp/mockErp';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const id = searchParams.get('id');

  if (type === 'facilities') {
    const data = await getFacilities();
    return NextResponse.json(data);
  }

  if (type === 'orders') {
    if (id) {
      const order = await getOrderById(id);
      return order ? NextResponse.json(order) : NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    const data = await getOrders();
    return NextResponse.json(data);
  }

  if (type === 'price') {
    const productId = searchParams.get('productId');
    const customerId = searchParams.get('customerId');
    if (!productId) return NextResponse.json({ error: 'Missing productId' }, { status: 400 });
    const price = await getPrice(productId, customerId || undefined);
    return price ? NextResponse.json(price) : NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
}

export async function POST(request: Request) {
  const body = await request.json();
  const order = await createOrder(body);
  return NextResponse.json(order, { status: 201 });
}
