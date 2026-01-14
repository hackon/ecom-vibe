import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'Welcome to Buildy McBuild Backend API',
    version: 'v1',
    endpoints: [
      '/api/backend/v1/auth/login',
      '/api/backend/v1/me',
      '/api/backend/v1/customers',
      '/api/backend/v1/facilities',
      '/api/backend/v1/catalog/products',
      '/api/backend/v1/orders'
    ]
  });
}
