// Mock Auth State
const sessions: Record<string, { userId: string, expires: string }> = {};

export async function login(credentials: Record<string, string>) {
  await new Promise(resolve => setTimeout(resolve, 150));
  if (credentials.username === 'admin' && credentials.password === 'password') {
    const token = 'mock-jwt-' + Math.random().toString(36).substr(2);
    sessions[token] = {
      userId: 'user-1',
      expires: new Date(Date.now() + 3600000).toISOString()
    };
    return { token, user: { id: 'user-1', username: 'admin', role: 'admin' } };
  }
  return null;
}

export async function getMe(token: string) {
  await new Promise(resolve => setTimeout(resolve, 50));
  const session = sessions[token];
  if (session) {
    return {
      id: session.userId,
      username: 'admin',
      email: 'admin@buildymcbuild.com',
      roles: ['admin', 'manager'],
      organizations: ['org-1']
    };
  }
  return null;
}

export async function logout(token: string) {
  delete sessions[token];
  return { success: true };
}

export async function getUsers() {
  return [
    { id: 'user-1', username: 'admin', email: 'admin@buildymcbuild.com', roles: ['admin'] }
  ];
}
