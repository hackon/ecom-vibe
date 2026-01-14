import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ contractId: string }> }
) {
  const { contractId } = await params;
  const authHeader = request.headers.get('authorization');
  const res = await fetch(`${API_BASE_URL}/api/3rdparty/erp?type=contracts&id=${contractId}`, {
    headers: { 'Authorization': authHeader || '' }
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
