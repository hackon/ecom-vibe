import { NextResponse } from 'next/server';
import { getOrganizations, getCustomers, getCustomerById, createCustomer, getCustomerTimeline } from '@/lib/crm/mockCrm';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const id = searchParams.get('id');

  if (type === 'organizations') {
    const data = await getOrganizations();
    return NextResponse.json(data);
  }

  if (type === 'customers') {
    if (id) {
      const customer = await getCustomerById(id);
      return customer ? NextResponse.json(customer) : NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    const data = await getCustomers();
    return NextResponse.json(data);
  }

  if (type === 'timeline' && id) {
    const data = await getCustomerTimeline(id);
    return NextResponse.json(data);
  }

  return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
}

export async function POST(request: Request) {
  const body = await request.json();
  const customer = await createCustomer(body);
  return NextResponse.json(customer, { status: 201 });
}
