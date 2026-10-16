'use client';

import { ReactNode, createContext, useCallback, useContext, useEffect, useState } from 'react';
import { clearToken, getToken, setToken } from '@/lib/auth';
import { api, ApiClientError, SESSION_EXPIRED_EVENT, type MeUser } from '@/lib/api';

interface AuthContextValue {
  // True until the initial check (token present? still valid? still admin?) finishes.
  isLoading: boolean;
  user: MeUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Only admins may use this app. Two layers: the API itself refuses every
// /admin route to a non-admin (that's the real gate), and this context also
// refuses to hold a session for one, so a non-admin never sees the shell.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<MeUser | null>(null);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  useEffect(() => {
    if (!getToken()) {
      setIsLoading(false);
      return;
    }
    api
      .getMe()
      .then(({ user }) => {
        if (user.role === 'admin') setUser(user);
        else clearToken();
      })
      .catch(() => clearToken())
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    window.addEventListener(SESSION_EXPIRED_EVENT, logout);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, logout);
  }, [logout]);

  const login = useCallback(async (email: string, password: string) => {
    const { token, user } = await api.login({ email, password });
    if (user.role !== 'admin') {
      // Same message as a wrong password — don't reveal which accounts exist
      // or which of them are non-admin.
      throw new ApiClientError('Invalid email or password', 401);
    }
    setToken(token);
    setUser(user);
  }, []);

  return <AuthContext.Provider value={{ isLoading, user, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
