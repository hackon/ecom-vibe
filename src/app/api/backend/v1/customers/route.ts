import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Call 3rdparty auth to get users
    const response = await fetch(`${API_BASE_URL}/api/3rdparty/auth?type=users`, {
      headers: {
        'Authorization': authHeader,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.error || 'Failed to fetch customers' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Extract users from 3rdparty response
    return NextResponse.json({
      customers: data.users,
      total: data.users.length,
    });
  } catch (error) {
    console.error('Backend customers error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
