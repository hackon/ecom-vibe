import { NextResponse } from 'next/server';

export async function GET() {
  // B4F logic - orchestrating data for the frontend
  const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/backend`);
  const data = await backendResponse.json();
  
  return NextResponse.json({
    source: 'b4f',
    timestamp: new Date().toISOString(),
    data
  });
}
