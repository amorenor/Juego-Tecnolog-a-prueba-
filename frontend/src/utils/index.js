export const HOLIDAYS = {
  '2026-01-01': 'Año Nuevo',
  '2026-04-03': 'Viernes Santo',
  '2026-04-04': 'Sábado Santo',
  '2026-05-01': 'Día del Trabajo',
  '2026-05-21': 'Glorias Navales',
  '2026-06-29': 'San Pedro y San Pablo',
  '2026-07-16': 'Virgen del Carmen',
  '2026-08-15': 'Asunción de la Virgen',
  '2026-09-18': 'Independencia Nacional',
  '2026-09-19': 'Glorias del Ejército',
  '2026-10-12': 'Encuentro de Dos Mundos',
  '2026-10-31': 'Día de las Iglesias Evangélicas',
  '2026-11-01': 'Día de Todos los Santos',
  '2026-12-08': 'Inmaculada Concepción',
  '2026-12-25': 'Navidad',
};

export function toDs(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function isWeekend(ds) {
  const d = new Date(ds + 'T12:00:00').getDay();
  return d === 0 || d === 6;
}

export function isHoliday(ds) { return !!HOLIDAYS[ds]; }

export function isWorkday(ds) { return !isWeekend(ds) && !isHoliday(ds); }

export function fmtDate(d) {
  if (!d) return '—';
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
}

export function calcAge(dateStr) {
  if (!dateStr) return null;
  const born = new Date(dateStr);
  const now  = new Date();
  return Math.floor((now - born) / (365.25 * 24 * 60 * 60 * 1000));
}

export function getMondayOf(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function weekDates(monday) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    return toDs(d);
  });
}

export function daysUntilNextOccurrence(month, day, today) {
  const thisYear  = new Date(today.getFullYear(), month, day);
  const nextYear  = new Date(today.getFullYear() + 1, month, day);
  const target    = thisYear >= today ? thisYear : nextYear;
  return Math.round((target - today) / (1000 * 60 * 60 * 24));
}
