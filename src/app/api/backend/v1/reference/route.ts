import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    countries: [
      { code: 'US', name: 'United States' },
      { code: 'CA', name: 'Canada' },
      { code: 'GB', name: 'United Kingdom' }
    ],
    currencies: [
      { code: 'USD', symbol: '$' },
      { code: 'EUR', symbol: '€' },
      { code: 'GBP', symbol: '£' }
    ],
    orderStatuses: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    unitOfMeasure: ['pcs', 'm', 'ft', 'kg', 'lb']
  });
}
