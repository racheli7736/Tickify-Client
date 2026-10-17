import { createContext } from 'react';
import type { LoginRequest, RegisterRequest, UserRole } from '../types/api';

export interface AuthContextValue {
  /** The logged-in user, or null. */
  user: { userId: number; fullName: string; role: UserRole } | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  /** True when the session was ended because the server rejected it or it expired (to explain it on the login page). */
  sessionExpired: boolean;
  login: (request: LoginRequest) => Promise<void>;
  register: (request: RegisterRequest) => Promise<void>;
  logout: () => void;
  dismissSessionExpired: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
