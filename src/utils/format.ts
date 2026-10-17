const LOCALE = 'he-IL';

const dateFormat = new Intl.DateTimeFormat(LOCALE, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const shortDateFormat = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'short', year: 'numeric' });
const timeFormat = new Intl.DateTimeFormat(LOCALE, { hour: '2-digit', minute: '2-digit' });
const monthFormat = new Intl.DateTimeFormat(LOCALE, { month: 'short' });
const dayFormat = new Intl.DateTimeFormat(LOCALE, { day: 'numeric' });
const priceFormat = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: 'ILS', minimumFractionDigits: 0, maximumFractionDigits: 2 });

// The API sends UTC timestamps; Intl shows them in the visitor's local time zone.
export const formatDate = (iso: string) => dateFormat.format(new Date(iso));
export const formatShortDate = (iso: string) => shortDateFormat.format(new Date(iso));
export const formatTime = (iso: string) => timeFormat.format(new Date(iso));
export const formatDateTime = (iso: string) => `${formatShortDate(iso)} · ${formatTime(iso)}`;
export const formatMonth = (iso: string) => monthFormat.format(new Date(iso));
export const formatDay = (iso: string) => dayFormat.format(new Date(iso));
export const formatPrice = (amount: number) => priceFormat.format(amount);

export const hasStarted = (iso: string) => new Date(iso).getTime() <= Date.now();
