import type { Order } from '../types/api';
import { hasStarted } from './format';

/** True when the server will accept a cancellation: an active order of an event that has not started. */
export const canCancel = (order: Order) => order.status === 'Active' && !hasStarted(order.eventStartsAt);
