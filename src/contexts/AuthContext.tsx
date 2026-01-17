'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Types for external customers
export type CustomerType = 'private' | 'professional';

// Types for internal users (Azure AD)
export type ADUserRole = 'admin' | 'sales' | 'employee';

export interface PrivateProfile {
  type: 'private';
  firstName: string;
  lastName: string;
  address: string;
  phone: string;
}

export interface ProfessionalProfile {
  type: 'professional';
  orgId: string;
  orgName: string;
  contactPerson: string;
  address: string;
  phone: string;
}

export type CustomerProfile = PrivateProfile | ProfessionalProfile;

// Base user interface
export interface BaseUser {
  id: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

// External customer user
export interface CustomerUser extends BaseUser {
  authMethod: 'password';
  customerType?: CustomerType;
  profile?: CustomerProfile;
}

// Internal AD user
export interface ADUser extends BaseUser {
  authMethod: 'ad';
  role: ADUserRole;
  displayName: string;
  givenName: string;
  surname: string;
  jobTitle: string;
  department: string;
  employeeId: string;
}

// Union type for all users
export type User = CustomerUser | ADUser;

// Type guards
export function isADUser(user: User): user is ADUser {
  return user.authMethod === 'ad';
}

export function isCustomerUser(user: User): user is CustomerUser {
  return user.authMethod === 'password' || !('authMethod' in user);
}

// Helper to check if user is internal (admin, sales, or employee via AD)
export function isInternalUser(user: User | null): boolean {
  return user !== null && isADUser(user);
}

// Helper to check specific roles
export function hasRole(user: User | null, role: ADUserRole): boolean {
  return user !== null && isADUser(user) && user.role === role;
}

export function isAdmin(user: User | null): boolean {
  return hasRole(user, 'admin');
}

export function isSales(user: User | null): boolean {
  return hasRole(user, 'sales');
}

export function isEmployee(user: User | null): boolean {
  return hasRole(user, 'employee');
}

// Helper to check if user can access admin area (admin only)
export function canAccessAdmin(user: User | null): boolean {
  return isAdmin(user);
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  needsProfile: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithAD: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string) => Promise<{ success: boolean; error?: string; needsProfile?: boolean }>;
  completeProfile: (profile: CustomerProfile) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Token storage keys
const ACCESS_TOKEN_KEY = 'auth_access_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';
const AUTH_METHOD_KEY = 'auth_method'; // 'password' or 'ad'

// Helper to get stored tokens
function getStoredTokens() {
  if (typeof window === 'undefined') return { accessToken: null, refreshToken: null, authMethod: null };
  return {
    accessToken: localStorage.getItem(ACCESS_TOKEN_KEY),
    refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY),
    authMethod: localStorage.getItem(AUTH_METHOD_KEY) as 'password' | 'ad' | null
  };
}

// Helper to store tokens
function storeTokens(accessToken: string, refreshToken: string, authMethod: 'password' | 'ad' = 'password') {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  localStorage.setItem(AUTH_METHOD_KEY, authMethod);
}

// Helper to clear tokens
function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(AUTH_METHOD_KEY);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    needsProfile: false
  });

  // Fetch current user with access token
  const fetchUser = useCallback(async (accessToken: string, authMethod: 'password' | 'ad'): Promise<User | null> => {
    try {
      const endpoint = authMethod === 'ad'
        ? '/api/3rdparty/azure-ad?type=me'
        : '/api/backend/v1/auth/me';

      const res = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      if (!res.ok) return null;

      const data = await res.json();

      if (authMethod === 'ad') {
        // AD user response
        return {
          id: data.user.objectId,
          email: data.user.email,
          authMethod: 'ad',
          role: data.role,
          displayName: data.user.displayName,
          givenName: data.user.givenName,
          surname: data.user.surname,
          jobTitle: data.user.jobTitle,
          department: data.user.department,
          employeeId: data.user.employeeId
        } as ADUser;
      }

      // Customer user response
      return {
        ...data,
        authMethod: 'password'
      } as CustomerUser;
    } catch {
      return null;
    }
  }, []);

  // Refresh access token
  const refreshAccessToken = useCallback(async (authMethod: 'password' | 'ad'): Promise<string | null> => {
    const { refreshToken } = getStoredTokens();
    if (!refreshToken) return null;

    try {
      const endpoint = authMethod === 'ad'
        ? '/api/3rdparty/azure-ad?action=refresh'
        : '/api/backend/v1/auth/refresh';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });

      if (!res.ok) {
        clearTokens();
        return null;
      }

      const data = await res.json();
      if (data.accessToken) {
        localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
        if (data.refreshToken) {
          localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
        }
        return data.accessToken;
      }

      return null;
    } catch {
      clearTokens();
      return null;
    }
  }, []);

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      const { accessToken, refreshToken, authMethod } = getStoredTokens();

      if (!accessToken && !refreshToken) {
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      const method = authMethod || 'password';

      // Try to fetch user with access token
      if (accessToken) {
        const user = await fetchUser(accessToken, method);
        if (user) {
          const needsProfile = isCustomerUser(user) && !user.customerType;
          setState({
            user,
            isAuthenticated: true,
            isLoading: false,
            needsProfile
          });
          return;
        }
      }

      // Access token invalid/expired, try refresh
      if (refreshToken) {
        const newAccessToken = await refreshAccessToken(method);
        if (newAccessToken) {
          const user = await fetchUser(newAccessToken, method);
          if (user) {
            const needsProfile = isCustomerUser(user) && !user.customerType;
            setState({
              user,
              isAuthenticated: true,
              isLoading: false,
              needsProfile
            });
            return;
          }
        }
      }

      // Both tokens invalid
      clearTokens();
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        needsProfile: false
      });
    };

    initAuth();
  }, [fetchUser, refreshAccessToken]);

  // Login with email/password (external customers)
  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch('/api/backend/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }

      storeTokens(data.accessToken, data.refreshToken, 'password');
      const user: CustomerUser = {
        ...data.user,
        authMethod: 'password'
      };
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        needsProfile: !user.customerType
      });

      return { success: true };
    } catch {
      return { success: false, error: 'Network error' };
    }
  }, []);

  // Login with Azure AD (internal users)
  const loginWithAD = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch('/api/backend/v1/auth/ad-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'AD Login failed' };
      }

      storeTokens(data.accessToken, data.refreshToken, 'ad');
      const user: ADUser = {
        id: data.user.id,
        email: data.user.email,
        authMethod: 'ad',
        role: data.user.role,
        displayName: data.user.displayName,
        givenName: data.user.givenName,
        surname: data.user.surname,
        jobTitle: data.user.jobTitle,
        department: data.user.department,
        employeeId: data.user.employeeId
      };
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        needsProfile: false
      });

      return { success: true };
    } catch {
      return { success: false, error: 'Network error' };
    }
  }, []);

  // Register (external customers only)
  const register = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch('/api/backend/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'Registration failed' };
      }

      storeTokens(data.accessToken, data.refreshToken, 'password');
      const user: CustomerUser = {
        ...data.user,
        authMethod: 'password'
      };
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        needsProfile: true
      });

      return { success: true, needsProfile: true };
    } catch {
      return { success: false, error: 'Network error' };
    }
  }, []);

  // Complete profile (step 2 of registration)
  const completeProfile = useCallback(async (profile: CustomerProfile) => {
    const { accessToken } = getStoredTokens();
    if (!accessToken) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const res = await fetch('/api/backend/v1/auth/complete-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(profile)
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to save profile' };
      }

      setState(prev => ({
        ...prev,
        user: prev.user ? { ...prev.user, ...data.user, authMethod: 'password' } as CustomerUser : null,
        needsProfile: false
      }));

      return { success: true };
    } catch {
      return { success: false, error: 'Network error' };
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    const { refreshToken, authMethod } = getStoredTokens();

    if (refreshToken) {
      try {
        const endpoint = authMethod === 'ad'
          ? '/api/3rdparty/azure-ad?action=logout'
          : '/api/backend/v1/auth/logout';

        await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken })
        });
      } catch {
        // Ignore errors on logout
      }
    }

    clearTokens();
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      needsProfile: false
    });
  }, []);

  // Refresh auth (manually trigger token refresh)
  const refreshAuth = useCallback(async () => {
    const { authMethod } = getStoredTokens();
    const method = authMethod || 'password';

    const newAccessToken = await refreshAccessToken(method);
    if (newAccessToken) {
      const user = await fetchUser(newAccessToken, method);
      if (user) {
        const needsProfile = isCustomerUser(user) && !user.customerType;
        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
          needsProfile
        });
        return;
      }
    }

    clearTokens();
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      needsProfile: false
    });
  }, [fetchUser, refreshAccessToken]);

  const value: AuthContextType = {
    ...state,
    login,
    loginWithAD,
    register,
    completeProfile,
    logout,
    refreshAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook to get access token for API calls
export function useAccessToken(): string | null {
  const { accessToken } = getStoredTokens();
  return accessToken;
}
