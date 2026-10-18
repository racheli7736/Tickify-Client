import { api } from './client';
import type { EventDetails, EventQuery, EventSummary, PagedResult, Seat } from '../types/api';

export const eventsApi = {
  /** Real server-side paging: the API runs Skip/Take in the database query. */
  async list(query: EventQuery, signal?: AbortSignal): Promise<PagedResult<EventSummary>> {
    const { data } = await api.get<PagedResult<EventSummary>>('/api/events', { params: query, signal });
    return data;
  },

  async get(id: number, signal?: AbortSignal): Promise<EventDetails> {
    const { data } = await api.get<EventDetails>(`/api/events/${id}`, { signal });
    return data;
  },

  /** The seat map of an event: every seat with its row, number and status (Available / Sold). */
  async seats(id: number, signal?: AbortSignal): Promise<Seat[]> {
    const { data } = await api.get<Seat[]>(`/api/events/${id}/seats`, { signal });
    return data;
  },
};
