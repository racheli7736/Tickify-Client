import type { Seat } from '../types/api';

/** The server allows 1-6 seats in one order (business rule 1). */
export const MAX_SEATS_PER_ORDER = 6;

export const seatLabel = (seat: Pick<Seat, 'row' | 'number'>) => `שורה ${seat.row} · מושב ${seat.number}`;

/**
 * The API describes the seats of an order as a code string such as "R3-S5, R3-S6".
 * This turns it into Hebrew text for display: "שורה 3 · מושב 5, שורה 3 · מושב 6".
 */
export function formatSeatsSummary(summary: string): string {
  return summary
    .split(',')
    .map((part) => {
      const match = /R(\d+)-S(\d+)/.exec(part.trim());
      return match ? `שורה ${match[1]} · מושב ${match[2]}` : part.trim();
    })
    .join(', ');
}

/** Seats grouped by row, rows and seats sorted ascending. */
export function groupByRow(seats: Seat[]): { row: number; seats: Seat[] }[] {
  const rows = new Map<number, Seat[]>();
  for (const seat of seats) {
    const list = rows.get(seat.row) ?? [];
    list.push(seat);
    rows.set(seat.row, list);
  }
  return [...rows.entries()]
    .sort(([a], [b]) => a - b)
    .map(([row, list]) => ({ row, seats: list.sort((a, b) => a.number - b.number) }));
}
