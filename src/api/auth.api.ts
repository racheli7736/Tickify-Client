import { api } from './client';
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types/api';

export const authApi = {
  async login(request: LoginRequest): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/api/auth/login', request);
    return data;
  },

  async register(request: RegisterRequest): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/api/auth/register', request);
    return data;
  },
};
