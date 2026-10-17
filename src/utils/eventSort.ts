import type { EventSortBy, SortDirection } from '../types/api';

export type SortValue = `${EventSortBy}:${SortDirection}`;

export const DEFAULT_SORT: SortValue = 'date:asc';

export const sortOptions: { value: SortValue; label: string }[] = [
  { value: 'date:asc', label: 'תאריך - הקרוב ראשון' },
  { value: 'date:desc', label: 'תאריך - הרחוק ראשון' },
  { value: 'price:asc', label: 'מחיר - מהזול ליקר' },
  { value: 'price:desc', label: 'מחיר - מהיקר לזול' },
  { value: 'name:asc', label: 'שם - א׳ עד ת׳' },
  { value: 'name:desc', label: 'שם - ת׳ עד א׳' },
];

/** Reads a sort value from the URL; anything unknown falls back to the default. */
export function parseSort(raw: string | null): SortValue {
  return sortOptions.some((option) => option.value === raw) ? (raw as SortValue) : DEFAULT_SORT;
}

export function splitSort(value: SortValue): { sortBy: EventSortBy; sortDir: SortDirection } {
  const [sortBy, sortDir] = value.split(':') as [EventSortBy, SortDirection];
  return { sortBy, sortDir };
}
