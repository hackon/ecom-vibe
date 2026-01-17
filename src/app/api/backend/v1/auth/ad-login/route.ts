import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function POST(request: Request) {
  const body = await request.json();

  const res = await fetch(`${API_BASE_URL}/api/3rdparty/azure-ad?action=authenticate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  const data = await res.json();

  // Extract from 3rdparty wrapper and transform for frontend
  if (data.source) {
    const { source, ...rest } = data;

    // Transform AD response to match our auth format
    if (rest.user && rest.accessToken) {
      return NextResponse.json({
        accessToken: rest.accessToken,
        refreshToken: rest.refreshToken,
        expiresIn: rest.expiresIn,
        user: {
          id: rest.user.objectId,
          email: rest.user.email,
          displayName: rest.user.displayName,
          givenName: rest.user.givenName,
          surname: rest.user.surname,
          jobTitle: rest.user.jobTitle,
          department: rest.user.department,
          role: rest.role,
          employeeId: rest.user.employeeId,
          authMethod: 'ad'
        }
      }, { status: res.status });
    }

    return NextResponse.json(rest, { status: res.status });
  }

  return NextResponse.json(data, { status: res.status });
}
