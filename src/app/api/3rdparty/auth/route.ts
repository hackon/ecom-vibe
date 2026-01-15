import { NextResponse } from 'next/server';
import {
  login,
  register,
  completeProfile,
  refreshAccessToken,
  getMe,
  logout,
  getUsers,
  CustomerProfile
} from '@/lib/auth/mockAuth';

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    // Login
    if (action === 'login') {
      const body = await request.json();
      const result = await login(body);

      if (!result) {
        return NextResponse.json(
          { source: '3rdparty-auth', error: 'Invalid email or password' },
          { status: 401 }
        );
      }

      return NextResponse.json({
        source: '3rdparty-auth',
        ...result
      });
    }

    // Register (step 1)
    if (action === 'register') {
      const body = await request.json();
      const result = await register(body);

      if ('error' in result) {
        return NextResponse.json(
          { source: '3rdparty-auth', error: result.error },
          { status: 400 }
        );
      }

      return NextResponse.json({
        source: '3rdparty-auth',
        ...result
      }, { status: 201 });
    }

    // Complete profile (step 2)
    if (action === 'complete-profile') {
      const authHeader = request.headers.get('authorization');
      const token = authHeader?.replace('Bearer ', '');

      if (!token) {
        return NextResponse.json(
          { source: '3rdparty-auth', error: 'No token provided' },
          { status: 401 }
        );
      }

      const body = await request.json() as CustomerProfile;
      const result = await completeProfile(token, body);

      if ('error' in result) {
        return NextResponse.json(
          { source: '3rdparty-auth', error: result.error },
          { status: 400 }
        );
      }

      return NextResponse.json({
        source: '3rdparty-auth',
        ...result
      });
    }

    // Refresh token
    if (action === 'refresh') {
      const body = await request.json();
      const result = await refreshAccessToken(body.refreshToken);

      if (!result) {
        return NextResponse.json(
          { source: '3rdparty-auth', error: 'Invalid or expired refresh token' },
          { status: 401 }
        );
      }

      return NextResponse.json({
        source: '3rdparty-auth',
        ...result
      });
    }

    // Logout
    if (action === 'logout') {
      const body = await request.json();
      await logout(body.refreshToken);
      return NextResponse.json({
        source: '3rdparty-auth',
        success: true
      });
    }

    return NextResponse.json(
      { source: '3rdparty-auth', error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { source: '3rdparty-auth', error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  // Get current user
  if (type === 'me') {
    if (!token) {
      return NextResponse.json(
        { source: '3rdparty-auth', error: 'No token provided' },
        { status: 401 }
      );
    }

    const user = await getMe(token);
    if (!user) {
      return NextResponse.json(
        { source: '3rdparty-auth', error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      source: '3rdparty-auth',
      user
    });
  }

  // Get all users (admin only in real app)
  if (type === 'users') {
    const users = await getUsers();
    return NextResponse.json({
      source: '3rdparty-auth',
      users
    });
  }

  return NextResponse.json(
    { source: '3rdparty-auth', error: 'Invalid type' },
    { status: 400 }
  );
}
