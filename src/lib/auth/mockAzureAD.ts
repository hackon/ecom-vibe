// Mock Azure AD Implementation
// Simulates Azure Active Directory authentication for internal users

export type ADUserRole = 'admin' | 'sales' | 'employee';

export interface ADUser {
  id: string;
  objectId: string; // Azure AD object ID
  email: string;
  displayName: string;
  givenName: string;
  surname: string;
  jobTitle: string;
  department: string;
  role: ADUserRole;
  employeeId: string;
  officeLocation?: string;
  mobilePhone?: string;
}

export interface ADTokenResponse {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
  scope: string;
}

export interface ADUserInfo {
  user: Omit<ADUser, 'id'> & { id: string };
  role: ADUserRole;
}

// Mock Azure AD configuration
const TENANT_ID = 'buildy-mcbuild-tenant';
const CLIENT_ID = 'buildy-mcbuild-client-app';
const AD_TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour
const AD_REFRESH_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

// In-memory AD user store - 2 of each role type
const adUsers: Map<string, ADUser> = new Map();
const adSessions: Map<string, { userId: string; expires: number }> = new Map();
const adRefreshTokens: Map<string, string> = new Map(); // refreshToken -> sessionId

// Seed AD users - 2 Admins
adUsers.set('ad-admin-1', {
  id: 'ad-admin-1',
  objectId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  email: 'sarah.johnson@buildymcbuild.com',
  displayName: 'Sarah Johnson',
  givenName: 'Sarah',
  surname: 'Johnson',
  jobTitle: 'IT Administrator',
  department: 'Information Technology',
  role: 'admin',
  employeeId: 'EMP001',
  officeLocation: 'Portland HQ - Floor 3',
  mobilePhone: '+1 503-555-1001'
});

adUsers.set('ad-admin-2', {
  id: 'ad-admin-2',
  objectId: 'b2c3d4e5-f6a7-8901-bcde-f23456789012',
  email: 'michael.chen@buildymcbuild.com',
  displayName: 'Michael Chen',
  givenName: 'Michael',
  surname: 'Chen',
  jobTitle: 'System Administrator',
  department: 'Information Technology',
  role: 'admin',
  employeeId: 'EMP002',
  officeLocation: 'Portland HQ - Floor 3',
  mobilePhone: '+1 503-555-1002'
});

// Seed AD users - 2 Sales Persons
adUsers.set('ad-sales-1', {
  id: 'ad-sales-1',
  objectId: 'c3d4e5f6-a7b8-9012-cdef-345678901234',
  email: 'emily.rodriguez@buildymcbuild.com',
  displayName: 'Emily Rodriguez',
  givenName: 'Emily',
  surname: 'Rodriguez',
  jobTitle: 'Senior Sales Representative',
  department: 'Sales',
  role: 'sales',
  employeeId: 'EMP003',
  officeLocation: 'Portland HQ - Floor 1',
  mobilePhone: '+1 503-555-2001'
});

adUsers.set('ad-sales-2', {
  id: 'ad-sales-2',
  objectId: 'd4e5f6a7-b8c9-0123-defa-456789012345',
  email: 'david.thompson@buildymcbuild.com',
  displayName: 'David Thompson',
  givenName: 'David',
  surname: 'Thompson',
  jobTitle: 'Sales Representative',
  department: 'Sales',
  role: 'sales',
  employeeId: 'EMP004',
  officeLocation: 'Seattle Office',
  mobilePhone: '+1 206-555-2002'
});

// Seed AD users - 2 Employees
adUsers.set('ad-employee-1', {
  id: 'ad-employee-1',
  objectId: 'e5f6a7b8-c9d0-1234-efab-567890123456',
  email: 'lisa.martinez@buildymcbuild.com',
  displayName: 'Lisa Martinez',
  givenName: 'Lisa',
  surname: 'Martinez',
  jobTitle: 'Warehouse Associate',
  department: 'Operations',
  role: 'employee',
  employeeId: 'EMP005',
  officeLocation: 'Portland Warehouse',
  mobilePhone: '+1 503-555-3001'
});

adUsers.set('ad-employee-2', {
  id: 'ad-employee-2',
  objectId: 'f6a7b8c9-d0e1-2345-fabc-678901234567',
  email: 'james.wilson@buildymcbuild.com',
  displayName: 'James Wilson',
  givenName: 'James',
  surname: 'Wilson',
  jobTitle: 'Customer Service Representative',
  department: 'Customer Support',
  role: 'employee',
  employeeId: 'EMP006',
  officeLocation: 'Portland HQ - Floor 2',
  mobilePhone: '+1 503-555-3002'
});

// Helper to create mock Azure AD JWT token
function createADToken(payload: object, expiresIn: number): string {
  const header = { alg: 'RS256', typ: 'JWT', kid: 'mock-key-id' };
  const exp = Math.floor((Date.now() + expiresIn) / 1000);
  const iat = Math.floor(Date.now() / 1000);
  const tokenPayload = {
    ...payload,
    exp,
    iat,
    nbf: iat,
    iss: `https://login.microsoftonline.com/${TENANT_ID}/v2.0`,
    aud: CLIENT_ID,
    ver: '2.0'
  };

  const headerB64 = Buffer.from(JSON.stringify(header)).toString('base64url');
  const payloadB64 = Buffer.from(JSON.stringify(tokenPayload)).toString('base64url');
  // Mock signature (in real Azure AD, this would be RSA signed)
  const signature = Buffer.from(`mock-signature-${headerB64}-${payloadB64}`).toString('base64url').slice(0, 43);

  return `${headerB64}.${payloadB64}.${signature}`;
}

// Decode and validate AD token
export function decodeADToken(token: string): { payload: Record<string, unknown>; valid: boolean } {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return { payload: {}, valid: false };

    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    const now = Math.floor(Date.now() / 1000);
    const isExpired = payload.exp && payload.exp < now;

    return { payload, valid: !isExpired };
  } catch {
    return { payload: {}, valid: false };
  }
}

function generateSessionId(): string {
  return 'ad-sess-' + Math.random().toString(36).substr(2, 12);
}

function generateRefreshToken(): string {
  return 'ad-rt-' + Math.random().toString(36).substr(2, 20) + Math.random().toString(36).substr(2, 20);
}

// Simulate Azure AD authorization code flow
// In real implementation, this would redirect to Microsoft login
export async function initiateADLogin(): Promise<{ authUrl: string; state: string }> {
  await new Promise(resolve => setTimeout(resolve, 50));

  const state = Math.random().toString(36).substr(2, 16);
  const authUrl = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/authorize?` +
    `client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent('http://localhost:3000/api/auth/callback/azure-ad')}&` +
    `scope=${encodeURIComponent('openid profile email User.Read')}&state=${state}`;

  return { authUrl, state };
}

// Simulate Azure AD token exchange (after receiving auth code)
// For mock purposes, we use email/password to simulate the AD login
export async function authenticateWithAD(email: string, password: string): Promise<ADTokenResponse | null> {
  await new Promise(resolve => setTimeout(resolve, 200)); // Simulate network delay

  // Find AD user by email
  let foundUser: ADUser | undefined;
  for (const user of adUsers.values()) {
    if (user.email.toLowerCase() === email.toLowerCase()) {
      foundUser = user;
      break;
    }
  }

  if (!foundUser) {
    return null;
  }

  // For mock purposes, accept 'adpassword' as the password for all AD users
  if (password !== 'adpassword') {
    return null;
  }

  // Create session
  const sessionId = generateSessionId();
  const refreshToken = generateRefreshToken();

  adSessions.set(sessionId, {
    userId: foundUser.id,
    expires: Date.now() + AD_REFRESH_EXPIRY
  });
  adRefreshTokens.set(refreshToken, sessionId);

  // Create tokens
  const accessToken = createADToken({
    sub: foundUser.objectId,
    oid: foundUser.objectId,
    preferred_username: foundUser.email,
    name: foundUser.displayName,
    email: foundUser.email,
    roles: [foundUser.role],
    tid: TENANT_ID
  }, AD_TOKEN_EXPIRY);

  const idToken = createADToken({
    sub: foundUser.objectId,
    oid: foundUser.objectId,
    preferred_username: foundUser.email,
    name: foundUser.displayName,
    given_name: foundUser.givenName,
    family_name: foundUser.surname,
    email: foundUser.email,
    tid: TENANT_ID
  }, AD_TOKEN_EXPIRY);

  return {
    accessToken,
    idToken,
    refreshToken,
    expiresIn: AD_TOKEN_EXPIRY / 1000,
    tokenType: 'Bearer',
    scope: 'openid profile email User.Read'
  };
}

// Get user info from access token (simulates MS Graph /me endpoint)
export async function getADUserInfo(accessToken: string): Promise<ADUserInfo | null> {
  await new Promise(resolve => setTimeout(resolve, 50));

  const { payload, valid } = decodeADToken(accessToken);
  if (!valid || !payload.oid) {
    return null;
  }

  // Find user by objectId
  let foundUser: ADUser | undefined;
  for (const user of adUsers.values()) {
    if (user.objectId === payload.oid) {
      foundUser = user;
      break;
    }
  }

  if (!foundUser) {
    return null;
  }

  return {
    user: foundUser,
    role: foundUser.role
  };
}

// Refresh AD tokens
export async function refreshADTokens(refreshToken: string): Promise<ADTokenResponse | null> {
  await new Promise(resolve => setTimeout(resolve, 100));

  const sessionId = adRefreshTokens.get(refreshToken);
  if (!sessionId) {
    return null;
  }

  const session = adSessions.get(sessionId);
  if (!session || session.expires < Date.now()) {
    adSessions.delete(sessionId);
    adRefreshTokens.delete(refreshToken);
    return null;
  }

  const user = adUsers.get(session.userId);
  if (!user) {
    return null;
  }

  // Generate new tokens
  const newRefreshToken = generateRefreshToken();
  adRefreshTokens.delete(refreshToken);
  adRefreshTokens.set(newRefreshToken, sessionId);

  // Update session expiry
  session.expires = Date.now() + AD_REFRESH_EXPIRY;
  adSessions.set(sessionId, session);

  const accessToken = createADToken({
    sub: user.objectId,
    oid: user.objectId,
    preferred_username: user.email,
    name: user.displayName,
    email: user.email,
    roles: [user.role],
    tid: TENANT_ID
  }, AD_TOKEN_EXPIRY);

  const idToken = createADToken({
    sub: user.objectId,
    oid: user.objectId,
    preferred_username: user.email,
    name: user.displayName,
    given_name: user.givenName,
    family_name: user.surname,
    email: user.email,
    tid: TENANT_ID
  }, AD_TOKEN_EXPIRY);

  return {
    accessToken,
    idToken,
    refreshToken: newRefreshToken,
    expiresIn: AD_TOKEN_EXPIRY / 1000,
    tokenType: 'Bearer',
    scope: 'openid profile email User.Read'
  };
}

// Logout from AD session
export async function logoutAD(refreshToken: string): Promise<{ success: boolean }> {
  await new Promise(resolve => setTimeout(resolve, 30));

  const sessionId = adRefreshTokens.get(refreshToken);
  if (sessionId) {
    adSessions.delete(sessionId);
    adRefreshTokens.delete(refreshToken);
  }

  return { success: true };
}

// Get all AD users (for admin purposes)
export async function getADUsers(): Promise<Omit<ADUser, 'id'>[]> {
  await new Promise(resolve => setTimeout(resolve, 50));

  return Array.from(adUsers.values()).map(({ id, ...user }) => ({
    ...user,
    id: user.objectId // Return objectId as the primary identifier
  }));
}

// Get AD users by role
export async function getADUsersByRole(role: ADUserRole): Promise<Omit<ADUser, 'id'>[]> {
  await new Promise(resolve => setTimeout(resolve, 50));

  return Array.from(adUsers.values())
    .filter(user => user.role === role)
    .map(({ id, ...user }) => ({
      ...user,
      id: user.objectId
    }));
}

// Validate if a user can impersonate another user
export function canImpersonate(salesUserRole: ADUserRole, targetUserType: string): boolean {
  // Only sales can impersonate
  if (salesUserRole !== 'sales') {
    return false;
  }

  // Sales can only impersonate external customers (private, professional)
  const allowedTargets = ['private', 'professional'];
  return allowedTargets.includes(targetUserType);
}

// Export for testing/debugging
export function getADUserCount(): number {
  return adUsers.size;
}

export function getADConfig() {
  return {
    tenantId: TENANT_ID,
    clientId: CLIENT_ID,
    tokenExpiry: AD_TOKEN_EXPIRY,
    refreshExpiry: AD_REFRESH_EXPIRY
  };
}
