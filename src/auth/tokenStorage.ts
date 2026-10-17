import type { AuthResponse, UserRole } from '../types/api';

/**
 * The session kept in localStorage so a refresh does not log the user out (the assignment asks for the JWT to be saved
 * and sent with every request). Only what the UI needs is stored: the token, its expiry, the display name and the role.
 * The e-mail address and the password are never stored. The role here is only for showing/hiding UI - the server
 * enforces every permission.
 */
export interface StoredSession {
  token: string;
  expiresAt: string;
  userId: number;
  fullName: string;
  role: UserRole;
}

const KEY = 'tickify.session';

export function toSession(response: AuthResponse): StoredSession {
  return {
    token: response.token,
    expiresAt: response.expiresAt,
    userId: response.userId,
    fullName: response.fullName,
    role: response.role,
  };
}

export function isExpired(session: StoredSession): boolean {
  return new Date(session.expiresAt).getTime() <= Date.now();
}

export function loadSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as StoredSession;
    if (!session.token || isExpired(session)) {
      localStorage.removeItem(KEY);
      return null;
    }
    return session;
  } catch {
    localStorage.removeItem(KEY);
    return null;
  }
}

export function saveSession(session: StoredSession): void {
  localStorage.setItem(KEY, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(KEY);
}

/** The token for the Axios interceptor (read on every request, so it is always current). */
export function getToken(): string | null {
  return loadSession()?.token ?? null;
}
