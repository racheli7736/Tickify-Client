import { api } from './client';
import type { CreateOrderRequest, Order, PageQuery, PagedResult } from '../types/api';

export const ordersApi = {
  /** Buys 1-6 seats, all or nothing. 409 means another user took one of the seats first. */
  async create(request: CreateOrderRequest): Promise<Order> {
    const { data } = await api.post<Order>('/api/orders', request);
    return data;
  },

  async list(query: PageQuery, signal?: AbortSignal): Promise<PagedResult<Order>> {
    const { data } = await api.get<PagedResult<Order>>('/api/orders', { params: query, signal });
    return data;
  },

  async cancel(id: number): Promise<void> {
    await api.delete(`/api/orders/${id}`);
  },
};
