import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'Welcome to Buildy McBuild Backend API',
    version: 'v1',
    endpoints: [
      '/api/backend/v1/auth/*',
      '/api/backend/v1/search',
      '/api/backend/v1/products/:productId',
      '/api/backend/v1/customers',
      '/api/backend/v1/pages',
      '/api/backend/v1/article/:slug'
    ]
  });
}
