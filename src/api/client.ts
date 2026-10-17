import axios from 'axios';
import { clearSession, getToken } from '../auth/tokenStorage';

/**
 * The single Axios instance of the app. The base URL comes from the Vite environment variable VITE_API_URL
 * (https://localhost:7003 in development) - never hard-coded in the code.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
});

type UnauthorizedHandler = () => void;
let onUnauthorized: UnauthorizedHandler | null = null;

/** The auth provider registers what happens when the server rejects the session (expired or invalid token). */
export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  onUnauthorized = handler;
}

// Send the JWT with every request.
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 401 on a protected call = the session is no longer valid: forget it and send the user to the login page.
// (A 401 from the login call itself just means "wrong e-mail or password" and is handled by the login form.)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url: string = error.config?.url ?? '';
    const isAuthCall = url.includes('/api/auth/');
    if (status === 401 && !isAuthCall) {
      clearSession();
      onUnauthorized?.();
    }
    return Promise.reject(error);
  },
);
