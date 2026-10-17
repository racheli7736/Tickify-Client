import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authApi } from '../api/auth.api';
import { setUnauthorizedHandler } from '../api/client';
import type { LoginRequest, RegisterRequest } from '../types/api';
import { AuthContext, type AuthContextValue } from './authContext';
import { clearSession, loadSession, saveSession, toSession, type StoredSession } from './tokenStorage';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<StoredSession | null>(() => loadSession());
  const [sessionExpired, setSessionExpired] = useState(false);

  const endSession = useCallback((expired: boolean) => {
    clearSession();
    setSession(null);
    setSessionExpired(expired);
  }, []);

  // The server answered 401 to a protected call -> the stored session is no longer valid.
  useEffect(() => {
    setUnauthorizedHandler(() => endSession(true));
    return () => setUnauthorizedHandler(null);
  }, [endSession]);

  // Log out automatically at the moment the token expires (an already expired token never gets here: loadSession drops it).
  useEffect(() => {
    if (!session) return;
    const remaining = new Date(session.expiresAt).getTime() - Date.now();
    // setTimeout cannot wait longer than ~24.8 days; tokens last an hour, but stay safe.
    const timer = window.setTimeout(() => endSession(true), Math.max(0, Math.min(remaining, 2_147_000_000)));
    return () => window.clearTimeout(timer);
  }, [session, endSession]);

  const start = useCallback((next: StoredSession) => {
    saveSession(next);
    setSession(next);
    setSessionExpired(false);
  }, []);

  const login = useCallback(
    async (request: LoginRequest) => start(toSession(await authApi.login(request))),
    [start],
  );

  const register = useCallback(
    async (request: RegisterRequest) => start(toSession(await authApi.register(request))),
    [start],
  );

  const logout = useCallback(() => endSession(false), [endSession]);
  const dismissSessionExpired = useCallback(() => setSessionExpired(false), []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session ? { userId: session.userId, fullName: session.fullName, role: session.role } : null,
      isAuthenticated: session !== null,
      isAdmin: session?.role === 'Admin',
      sessionExpired,
      login,
      register,
      logout,
      dismissSessionExpired,
    }),
    [session, sessionExpired, login, register, logout, dismissSessionExpired],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
