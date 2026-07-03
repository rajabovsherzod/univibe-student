// Locale-aware date helpers. Intl's Uzbek ("uz") data returns junk like "M06"
// for short months and poor weekday abbreviations, so we hand-roll Uzbek and
// fall back to Intl for ru/en.

const TAG: Record<string, string> = { uz: 'uz', ru: 'ru-RU', en: 'en-US' };

const UZ_MONTHS_SHORT = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn', 'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];
// getDay(): 0 = Sunday … 6 = Saturday
const UZ_WEEKDAYS_SHORT = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan'];

export function monthShort(iso: string | Date, locale: string): string {
  const d = new Date(iso);
  if (locale === 'uz') return UZ_MONTHS_SHORT[d.getMonth()];
  return new Intl.DateTimeFormat(TAG[locale] || 'en-US', { month: 'short' }).format(d);
}

export function weekdayShort(iso: string | Date, locale: string): string {
  const d = new Date(iso);
  if (locale === 'uz') return UZ_WEEKDAYS_SHORT[d.getDay()];
  return new Intl.DateTimeFormat(TAG[locale] || 'en-US', { weekday: 'short' }).format(d);
}

/** Day of month, zero-padded (for compact date badges). */
export function dayPad(iso: string | Date): string {
  return String(new Date(iso).getDate()).padStart(2, '0');
}

export function timeHM(iso: string | Date, locale: string): string {
  return new Intl.DateTimeFormat(TAG[locale] || 'en-US', { hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
}

/** e.g. uz → "Pay, 25 Iyn · 14:30", en → "Thu, 25 Jun · 14:30" */
export function eventWhen(iso: string | Date, locale: string): string {
  const d = new Date(iso);
  return `${weekdayShort(d, locale)}, ${d.getDate()} ${monthShort(d, locale)} · ${timeHM(d, locale)}`;
}
