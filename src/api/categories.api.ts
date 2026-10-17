import { api } from './client';
import type { Category } from '../types/api';

export const categoriesApi = {
  async list(signal?: AbortSignal): Promise<Category[]> {
    const { data } = await api.get<Category[]>('/api/categories', { signal });
    return data;
  },
};
