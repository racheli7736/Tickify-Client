import { api } from './client';
import type { Category, CategoryRequest } from '../types/api';

export const categoriesApi = {
  async list(signal?: AbortSignal): Promise<Category[]> {
    const { data } = await api.get<Category[]>('/api/categories', { signal });
    return data;
  },

  /** Admin: 409 when a category with the same name (ignoring case) exists. */
  async create(request: CategoryRequest): Promise<Category> {
    const { data } = await api.post<Category>('/api/categories', request);
    return data;
  },

  async rename(id: number, request: CategoryRequest): Promise<void> {
    await api.put(`/api/categories/${id}`, request);
  },

  /** Admin: 409 when the category is assigned to events. */
  async remove(id: number): Promise<void> {
    await api.delete(`/api/categories/${id}`);
  },
};
