/** Local calendar date as YYYY-MM-DD (avoids UTC off-by-one bugs). */
export function getToday() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Normalize API date values to local YYYY-MM-DD. */
export function normalizeLogDate(value) {
  if (value == null || value === '') return '';
  const str = String(value);
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return str.slice(0, 10);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function formatLogDate(value) {
  const raw = normalizeLogDate(value);
  if (!raw) return '';
  const [year, month, day] = raw.split('-').map(Number);
  if (!year || !month || !day) return raw;
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function isToday(value) {
  return normalizeLogDate(value) === getToday();
}
