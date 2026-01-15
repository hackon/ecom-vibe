'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Types
export type CustomerType = 'private' | 'professional' | 'employee';

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

export interface EmployeeProfile {
  type: 'employee';
  employeeEmail: string;
  department?: string;
}

export type CustomerProfile = PrivateProfile | ProfessionalProfile | EmployeeProfile;

export interface User {
  id: string;
  email: string;
  customerType?: CustomerType;
  profile?: CustomerProfile;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  needsProfile: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string) => Promise<{ success: boolean; error?: string; needsProfile?: boolean }>;
  completeProfile: (profile: CustomerProfile) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Token storage keys
const ACCESS_TOKEN_KEY = 'auth_access_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';

// Helper to get stored tokens
function getStoredTokens() {
  if (typeof window === 'undefined') return { accessToken: null, refreshToken: null };
  return {
    accessToken: localStorage.getItem(ACCESS_TOKEN_KEY),
    refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY)
  };
}

// Helper to store tokens
function storeTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

// Helper to clear tokens
function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    needsProfile: false
  });

  // Fetch current user with access token
  const fetchUser = useCallback(async (accessToken: string): Promise<User | null> => {
    try {
      const res = await fetch('/api/backend/v1/auth/me', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      if (!res.ok) return null;

      const user = await res.json();
      return user;
    } catch {
      return null;
    }
  }, []);

  // Refresh access token
  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    const { refreshToken } = getStoredTokens();
    if (!refreshToken) return null;

    try {
      const res = await fetch('/api/backend/v1/auth/refresh', {
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
      const { accessToken, refreshToken } = getStoredTokens();

      if (!accessToken && !refreshToken) {
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      // Try to fetch user with access token
      if (accessToken) {
        const user = await fetchUser(accessToken);
        if (user) {
          setState({
            user,
            isAuthenticated: true,
            isLoading: false,
            needsProfile: !user.customerType
          });
          return;
        }
      }

      // Access token invalid/expired, try refresh
      if (refreshToken) {
        const newAccessToken = await refreshAccessToken();
        if (newAccessToken) {
          const user = await fetchUser(newAccessToken);
          if (user) {
            setState({
              user,
              isAuthenticated: true,
              isLoading: false,
              needsProfile: !user.customerType
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

  // Login
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

      storeTokens(data.accessToken, data.refreshToken);
      setState({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
        needsProfile: !data.user.customerType
      });

      return { success: true };
    } catch {
      return { success: false, error: 'Network error' };
    }
  }, []);

  // Register
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

      storeTokens(data.accessToken, data.refreshToken);
      setState({
        user: data.user,
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
        user: data.user,
        needsProfile: false
      }));

      return { success: true };
    } catch {
      return { success: false, error: 'Network error' };
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    const { refreshToken } = getStoredTokens();

    if (refreshToken) {
      try {
        await fetch('/api/backend/v1/auth/logout', {
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
    const newAccessToken = await refreshAccessToken();
    if (newAccessToken) {
      const user = await fetchUser(newAccessToken);
      if (user) {
        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
          needsProfile: !user.customerType
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
