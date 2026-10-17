export interface Availability {
  label: string;
  color: 'success' | 'warning' | 'error';
}

/** At or below this number of free seats an event is shown as "almost sold out". */
const LOW_SEATS = 10;

export function availabilityOf(availableSeats: number): Availability {
  if (availableSeats <= 0) return { label: 'אזלו הכרטיסים', color: 'error' };
  if (availableSeats <= LOW_SEATS) return { label: `נותרו ${availableSeats} מושבים בלבד`, color: 'warning' };
  return { label: `${availableSeats} מושבים פנויים`, color: 'success' };
}
