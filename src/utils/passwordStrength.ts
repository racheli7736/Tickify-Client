export interface Strength {
  /** 0-100 */
  value: number;
  label: string;
  color: 'error' | 'warning' | 'success';
}

/** A simple, honest hint for the user (the server only requires 6 characters). */
export function measureStrength(password: string): Strength | null {
  if (!password) return null;

  let score = 0;
  if (password.length >= 6) score += 1;
  if (password.length >= 10) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (password.length < 6 || score <= 2) return { value: 33, label: 'חלשה', color: 'error' };
  if (score <= 3) return { value: 66, label: 'בינונית', color: 'warning' };
  return { value: 100, label: 'חזקה', color: 'success' };
}
