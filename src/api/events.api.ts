import { api } from './client';
import type { CreateEventRequest, EventDetails, EventQuery, EventSummary, PagedResult, Seat, UpdateEventRequest } from '../types/api';

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

  /** Admin: creates the event and all its seats (rows x seats per row). */
  async create(request: CreateEventRequest): Promise<EventDetails> {
    const { data } = await api.post<EventDetails>('/api/events', request);
    return data;
  },

  /** Admin: details and categories only; the seat structure cannot change. */
  async update(id: number, request: UpdateEventRequest): Promise<void> {
    await api.put(`/api/events/${id}`, request);
  },

  /** Admin: only allowed when no ticket was ever sold (otherwise 409). */
  async remove(id: number): Promise<void> {
    await api.delete(`/api/events/${id}`);
  },
};
