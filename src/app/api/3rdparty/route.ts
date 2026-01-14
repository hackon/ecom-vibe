import { NextResponse } from 'next/server';

export async function GET() {
  // 3rd party logic - mimicking realistic delays and simple data structures
  await new Promise(resolve => setTimeout(resolve, 100)); // Simulate delay
  
  return NextResponse.json({
    source: '3rdparty',
    products: [
      { id: 1, name: 'Premium Oak Plank', category: 'Wood' },
      { id: 2, name: 'Japanese Pull Saw', category: 'Tools' },
      { id: 3, name: 'Antique Brass Hinge', category: 'Hardware' }
    ]
  });
}
