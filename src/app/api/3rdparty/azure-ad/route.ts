import { NextResponse } from 'next/server';
import {
  authenticateWithAD,
  getADUserInfo,
  refreshADTokens,
  logoutAD,
  getADUsers,
  getADUsersByRole,
  initiateADLogin,
  getADConfig,
  ADUserRole
} from '@/lib/auth/mockAzureAD';

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    // Initiate AD login (get auth URL)
    if (action === 'initiate') {
      const result = await initiateADLogin();
      return NextResponse.json({
        source: '3rdparty-azure-ad',
        ...result
      });
    }

    // Authenticate with AD (email/password for mock)
    if (action === 'authenticate') {
      const body = await request.json();
      const { email, password } = body;

      if (!email || !password) {
        return NextResponse.json(
          { source: '3rdparty-azure-ad', error: 'Email and password are required' },
          { status: 400 }
        );
      }

      const result = await authenticateWithAD(email, password);

      if (!result) {
        return NextResponse.json(
          { source: '3rdparty-azure-ad', error: 'Invalid credentials or user not found in Azure AD' },
          { status: 401 }
        );
      }

      // Get user info to include in response
      const userInfo = await getADUserInfo(result.accessToken);

      return NextResponse.json({
        source: '3rdparty-azure-ad',
        ...result,
        user: userInfo?.user,
        role: userInfo?.role
      });
    }

    // Refresh tokens
    if (action === 'refresh') {
      const body = await request.json();
      const { refreshToken } = body;

      if (!refreshToken) {
        return NextResponse.json(
          { source: '3rdparty-azure-ad', error: 'Refresh token is required' },
          { status: 400 }
        );
      }

      const result = await refreshADTokens(refreshToken);

      if (!result) {
        return NextResponse.json(
          { source: '3rdparty-azure-ad', error: 'Invalid or expired refresh token' },
          { status: 401 }
        );
      }

      // Get updated user info
      const userInfo = await getADUserInfo(result.accessToken);

      return NextResponse.json({
        source: '3rdparty-azure-ad',
        ...result,
        user: userInfo?.user,
        role: userInfo?.role
      });
    }

    // Logout
    if (action === 'logout') {
      const body = await request.json();
      const { refreshToken } = body;

      await logoutAD(refreshToken || '');

      return NextResponse.json({
        source: '3rdparty-azure-ad',
        success: true
      });
    }

    return NextResponse.json(
      { source: '3rdparty-azure-ad', error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Azure AD error:', error);
    return NextResponse.json(
      { source: '3rdparty-azure-ad', error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  try {
    // Get current user info
    if (type === 'me') {
      if (!token) {
        return NextResponse.json(
          { source: '3rdparty-azure-ad', error: 'No token provided' },
          { status: 401 }
        );
      }

      const userInfo = await getADUserInfo(token);

      if (!userInfo) {
        return NextResponse.json(
          { source: '3rdparty-azure-ad', error: 'Invalid or expired token' },
          { status: 401 }
        );
      }

      return NextResponse.json({
        source: '3rdparty-azure-ad',
        ...userInfo
      });
    }

    // Get all AD users (admin only in real app)
    if (type === 'users') {
      const role = searchParams.get('role') as ADUserRole | null;

      const users = role
        ? await getADUsersByRole(role)
        : await getADUsers();

      return NextResponse.json({
        source: '3rdparty-azure-ad',
        users,
        count: users.length
      });
    }

    // Get AD configuration (public info)
    if (type === 'config') {
      const config = getADConfig();
      return NextResponse.json({
        source: '3rdparty-azure-ad',
        config: {
          tenantId: config.tenantId,
          clientId: config.clientId
        }
      });
    }

    return NextResponse.json(
      { source: '3rdparty-azure-ad', error: 'Invalid type' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Azure AD error:', error);
    return NextResponse.json(
      { source: '3rdparty-azure-ad', error: 'Internal server error' },
      { status: 500 }
    );
  }
}
