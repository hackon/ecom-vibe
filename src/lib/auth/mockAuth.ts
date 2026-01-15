// Mock Auth State with JWT-like tokens

// Customer types
export type CustomerType = 'private' | 'professional' | 'employee';

export interface PrivateCustomerProfile {
  type: 'private';
  firstName: string;
  lastName: string;
  address: string;
  phone: string;
}

export interface ProfessionalCustomerProfile {
  type: 'professional';
  orgId: string;
  orgName: string;
  contactPerson: string;
  address: string;
  phone: string;
}

export interface EmployeeCustomerProfile {
  type: 'employee';
  employeeEmail: string;
  department?: string;
}

export type CustomerProfile = PrivateCustomerProfile | ProfessionalCustomerProfile | EmployeeCustomerProfile;

export interface User {
  id: string;
  email: string;
  passwordHash: string; // In real app, this would be hashed
  customerType?: CustomerType;
  profile?: CustomerProfile;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  userId: string;
  expires: string;
  refreshToken: string;
}

// JWT secret (in real app, this would be an environment variable)
const JWT_SECRET = 'mock-jwt-secret-key-for-demo';
const ACCESS_TOKEN_EXPIRY = 15 * 60 * 1000; // 15 minutes
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

// In-memory storage
const users: Map<string, User> = new Map();
const sessions: Map<string, Session> = new Map();
const refreshTokens: Map<string, string> = new Map(); // refreshToken -> sessionId

// Seed some users
users.set('user-1', {
  id: 'user-1',
  email: 'admin@buildymcbuild.com',
  passwordHash: 'password123',
  customerType: 'employee',
  profile: {
    type: 'employee',
    employeeEmail: 'admin@buildymcbuild.com',
    department: 'Management'
  },
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z'
});

users.set('user-2', {
  id: 'user-2',
  email: 'john@example.com',
  passwordHash: 'password123',
  customerType: 'private',
  profile: {
    type: 'private',
    firstName: 'John',
    lastName: 'Doe',
    address: '123 Oak Street, Portland, OR 97201',
    phone: '+1 503-555-0123'
  },
  createdAt: '2026-01-05T10:00:00Z',
  updatedAt: '2026-01-05T10:00:00Z'
});

users.set('user-3', {
  id: 'user-3',
  email: 'contact@woodworks.com',
  passwordHash: 'password123',
  customerType: 'professional',
  profile: {
    type: 'professional',
    orgId: 'ORG-001',
    orgName: 'WoodWorks Inc.',
    contactPerson: 'Jane Smith',
    address: '456 Industrial Ave, Seattle, WA 98101',
    phone: '+1 206-555-0456'
  },
  createdAt: '2026-01-03T14:00:00Z',
  updatedAt: '2026-01-03T14:00:00Z'
});

// Helper to create JWT-like token
function createToken(payload: object, expiresIn: number): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const exp = Date.now() + expiresIn;
  const tokenPayload = { ...payload, exp, iat: Date.now() };

  // Base64 encode (simplified - real JWT would use proper signing)
  const headerB64 = Buffer.from(JSON.stringify(header)).toString('base64url');
  const payloadB64 = Buffer.from(JSON.stringify(tokenPayload)).toString('base64url');
  const signature = Buffer.from(JWT_SECRET + headerB64 + payloadB64).toString('base64url').slice(0, 43);

  return `${headerB64}.${payloadB64}.${signature}`;
}

// Helper to decode token
function decodeToken(token: string): { payload: Record<string, unknown>; valid: boolean } {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return { payload: {}, valid: false };

    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    const isExpired = payload.exp && payload.exp < Date.now();

    return { payload, valid: !isExpired };
  } catch {
    return { payload: {}, valid: false };
  }
}

// Generate unique ID
function generateId(): string {
  return 'user-' + Math.random().toString(36).substr(2, 9);
}

function generateRefreshToken(): string {
  return 'rt-' + Math.random().toString(36).substr(2, 16) + Math.random().toString(36).substr(2, 16);
}

// Auth functions
export async function login(credentials: { email: string; password: string }) {
  await new Promise(resolve => setTimeout(resolve, 150)); // Simulate network delay

  // Find user by email
  let foundUser: User | undefined;
  for (const user of users.values()) {
    if (user.email.toLowerCase() === credentials.email.toLowerCase()) {
      foundUser = user;
      break;
    }
  }

  if (!foundUser || foundUser.passwordHash !== credentials.password) {
    return null;
  }

  // Create session
  const sessionId = 'sess-' + Math.random().toString(36).substr(2, 9);
  const refreshToken = generateRefreshToken();
  const accessToken = createToken({
    sub: foundUser.id,
    email: foundUser.email,
    customerType: foundUser.customerType
  }, ACCESS_TOKEN_EXPIRY);

  sessions.set(sessionId, {
    userId: foundUser.id,
    expires: new Date(Date.now() + REFRESH_TOKEN_EXPIRY).toISOString(),
    refreshToken
  });
  refreshTokens.set(refreshToken, sessionId);

  // Return user data without password
  const { passwordHash, ...userWithoutPassword } = foundUser;

  return {
    accessToken,
    refreshToken,
    expiresIn: ACCESS_TOKEN_EXPIRY / 1000,
    user: userWithoutPassword
  };
}

export async function register(data: { email: string; password: string }) {
  await new Promise(resolve => setTimeout(resolve, 200)); // Simulate network delay

  // Check if email already exists
  for (const user of users.values()) {
    if (user.email.toLowerCase() === data.email.toLowerCase()) {
      return { error: 'Email already registered' };
    }
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    return { error: 'Invalid email format' };
  }

  // Validate password
  if (data.password.length < 6) {
    return { error: 'Password must be at least 6 characters' };
  }

  // Create new user (without profile yet)
  const userId = generateId();
  const now = new Date().toISOString();
  const newUser: User = {
    id: userId,
    email: data.email,
    passwordHash: data.password, // In real app, hash this
    createdAt: now,
    updatedAt: now
  };

  users.set(userId, newUser);

  // Create session and return tokens
  const sessionId = 'sess-' + Math.random().toString(36).substr(2, 9);
  const refreshToken = generateRefreshToken();
  const accessToken = createToken({
    sub: newUser.id,
    email: newUser.email,
    customerType: newUser.customerType
  }, ACCESS_TOKEN_EXPIRY);

  sessions.set(sessionId, {
    userId: newUser.id,
    expires: new Date(Date.now() + REFRESH_TOKEN_EXPIRY).toISOString(),
    refreshToken
  });
  refreshTokens.set(refreshToken, sessionId);

  const { passwordHash, ...userWithoutPassword } = newUser;

  return {
    accessToken,
    refreshToken,
    expiresIn: ACCESS_TOKEN_EXPIRY / 1000,
    user: userWithoutPassword,
    needsProfile: true // Indicates registration step 2 is needed
  };
}

export async function completeProfile(token: string, profile: CustomerProfile) {
  await new Promise(resolve => setTimeout(resolve, 100));

  const { payload, valid } = decodeToken(token);
  if (!valid || !payload.sub) {
    return { error: 'Invalid or expired token' };
  }

  const user = users.get(payload.sub as string);
  if (!user) {
    return { error: 'User not found' };
  }

  // Update user with profile
  user.customerType = profile.type;
  user.profile = profile;
  user.updatedAt = new Date().toISOString();
  users.set(user.id, user);

  const { passwordHash, ...userWithoutPassword } = user;
  return { user: userWithoutPassword };
}

export async function refreshAccessToken(refreshToken: string) {
  await new Promise(resolve => setTimeout(resolve, 50));

  const sessionId = refreshTokens.get(refreshToken);
  if (!sessionId) {
    return null;
  }

  const session = sessions.get(sessionId);
  if (!session || new Date(session.expires) < new Date()) {
    // Session expired, clean up
    sessions.delete(sessionId);
    refreshTokens.delete(refreshToken);
    return null;
  }

  const user = users.get(session.userId);
  if (!user) {
    return null;
  }

  // Generate new access token
  const accessToken = createToken({
    sub: user.id,
    email: user.email,
    customerType: user.customerType
  }, ACCESS_TOKEN_EXPIRY);

  const { passwordHash, ...userWithoutPassword } = user;

  return {
    accessToken,
    expiresIn: ACCESS_TOKEN_EXPIRY / 1000,
    user: userWithoutPassword
  };
}

export async function getMe(token: string) {
  await new Promise(resolve => setTimeout(resolve, 50));

  const { payload, valid } = decodeToken(token);
  if (!valid || !payload.sub) {
    return null;
  }

  const user = users.get(payload.sub as string);
  if (!user) {
    return null;
  }

  const { passwordHash, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function logout(refreshToken: string) {
  await new Promise(resolve => setTimeout(resolve, 30));

  const sessionId = refreshTokens.get(refreshToken);
  if (sessionId) {
    sessions.delete(sessionId);
    refreshTokens.delete(refreshToken);
  }

  return { success: true };
}

export async function getUsers() {
  await new Promise(resolve => setTimeout(resolve, 50));

  return Array.from(users.values()).map(({ passwordHash, ...user }) => user);
}

export async function validateToken(token: string): Promise<boolean> {
  const { valid } = decodeToken(token);
  return valid;
}
