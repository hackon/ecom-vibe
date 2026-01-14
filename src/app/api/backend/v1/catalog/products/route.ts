import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function GET() {
  const pimRes = await fetch(`${API_BASE_URL}/api/3rdparty/pim`);
  const products = await pimRes.json();
  
  // In a real BFF, we would aggregate data from ERP for stock/price here
  // For now, return the basic catalog
  return NextResponse.json(products);
}
