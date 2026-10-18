// Types that mirror the Tickify.API DTOs (Tickify.Core/DTOs). Enums travel as strings.

export type UserRole = 'User' | 'Admin';
export type SeatStatus = 'Available' | 'Sold';
export type OrderStatus = 'Active' | 'Cancelled';

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

// ---------- auth ----------
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  userId: number;
  token: string;
  expiresAt: string;
  fullName: string;
  role: UserRole;
}

export interface UserProfile {
  id: number;
  fullName: string;
  role: UserRole;
  createdAt: string;
}

// ---------- events ----------
export interface EventSummary {
  id: number;
  name: string;
  venue: string;
  startsAt: string;
  ticketPrice: number;
  categories: string[];
  availableSeats: number;
}

export interface EventDetails extends EventSummary {
  description: string;
  rows: number;
  seatsPerRow: number;
  createdAt: string;
}

export type EventSortBy = 'date' | 'price' | 'name';
export type SortDirection = 'asc' | 'desc';

export interface EventQuery {
  categoryId?: number;
  search?: string;
  sortBy?: EventSortBy;
  sortDir?: SortDirection;
  page?: number;
  pageSize?: number;
}

export interface CreateEventRequest {
  name: string;
  description: string;
  venue: string;
  startsAt: string;
  ticketPrice: number;
  rows: number;
  seatsPerRow: number;
  categoryIds: number[];
}

export type UpdateEventRequest = Omit<CreateEventRequest, 'rows' | 'seatsPerRow'>;

// ---------- seats ----------
export interface Seat {
  id: number;
  row: number;
  number: number;
  status: SeatStatus;
}

// ---------- orders ----------
export interface CreateOrderRequest {
  eventId: number;
  seatIds: number[];
}

export interface Order {
  id: number;
  userId: number;
  userFullName: string | null;
  eventId: number;
  eventName: string;
  eventStartsAt: string;
  createdAt: string;
  status: OrderStatus;
  totalPrice: number;
  seatsSummary: string;
}

export interface PageQuery {
  page?: number;
  pageSize?: number;
}

// ---------- categories ----------
export interface Category {
  id: number;
  name: string;
}

export interface CategoryRequest {
  name: string;
}

// ---------- errors (RFC 7807 problem details, extended with correlationId) ----------
export interface ProblemDetails {
  status: number;
  title?: string;
  detail?: string;
  correlationId?: string;
  errors?: Record<string, string[]>;
}
