import { NextResponse } from 'next/server';

// GET /api/3rdparty/cms/store/[storeId] - store configuration (mocked, not used yet)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ storeId: string }> }
) {
  await new Promise(resolve => setTimeout(resolve, 30)); // Simulate network delay

  const { storeId } = await params;

  // Mock store configurations
  const stores: Record<string, object> = {
    'default': {
      id: 'default',
      name: 'Buildy McBuild',
      locale: 'en-US',
      currency: 'USD',
      theme: {
        primaryColor: '#d97706',
        secondaryColor: '#1f2937'
      },
      features: {
        wishlist: true,
        reviews: false,
        compareProducts: false
      }
    },
    'eu': {
      id: 'eu',
      name: 'Buildy McBuild EU',
      locale: 'en-GB',
      currency: 'EUR',
      theme: {
        primaryColor: '#d97706',
        secondaryColor: '#1f2937'
      },
      features: {
        wishlist: true,
        reviews: true,
        compareProducts: true
      }
    }
  };

  const store = stores[storeId];
  if (!store) {
    return NextResponse.json({ error: 'Store not found' }, { status: 404 });
  }

  return NextResponse.json({
    source: '3rdparty-cms',
    store
  });
}
