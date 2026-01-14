import { NextResponse } from 'next/server';
import { login, getMe, logout, getUsers } from '@/lib/auth/mockAuth';

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'login') {
    const body = await request.json();
    const result = await login(body);
    return result ? NextResponse.json(result) : NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (action === 'logout') {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    if (token) await logout(token);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (type === 'me') {
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = await getMe(token);
    return user ? NextResponse.json(user) : NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (type === 'users') {
    const users = await getUsers();
    return NextResponse.json(users);
  }

  return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
}
