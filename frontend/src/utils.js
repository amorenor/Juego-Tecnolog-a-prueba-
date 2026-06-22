// ── Shared utilities ──────────────────────────────────────────────────────────

export const HOLIDAYS = {
  '2026-01-01': 'Año Nuevo',
  '2026-04-03': 'Viernes Santo',
  '2026-04-04': 'Sábado Santo',
  '2026-05-01': 'Día del Trabajo',
  '2026-05-21': 'Glorias Navales',
  '2026-06-29': 'San Pedro y San Pablo',
  '2026-07-16': 'Virgen del Carmen',
  '2026-08-15': 'Asunción de la Virgen',
  '2026-09-18': 'Fiestas Patrias',
  '2026-09-19': 'Día del Ejército',
  '2026-10-12': 'Día de la Raza',
  '2026-11-01': 'Todos los Santos',
  '2026-12-08': 'Inmaculada Concepción',
  '2026-12-25': 'Navidad',
};

export function toDs(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function isWeekend(ds) {
  const w = new Date(ds + 'T12:00:00').getDay();
  return w === 0 || w === 6;
}

export function isHoliday(ds)  { return !!HOLIDAYS[ds]; }
export function isWorkday(ds)  { return !isWeekend(ds) && !isHoliday(ds); }

export function fmtDate(d) {
  if (!d) return '—';
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
}

export function calcAge(dateStr) {
  const born = new Date(dateStr);
  return Math.floor((Date.now() - born) / (365.25 * 24 * 60 * 60 * 1000));
}

export function slugify(s) {
  return (s || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export function getMondayOf(d) {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  const w = r.getDay();
  r.setDate(r.getDate() - (w === 0 ? 6 : w - 1));
  return r;
}

export function weekDates(monday) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    return toDs(d);
  });
}

export function daysUntilNextOccurrence(month, day, today) {
  const thisYear = new Date(today.getFullYear(), month, day);
  let diff = Math.round((thisYear - today) / (1000 * 60 * 60 * 24));
  if (diff < 0) {
    const nextYear = new Date(today.getFullYear() + 1, month, day);
    diff = Math.round((nextYear - today) / (1000 * 60 * 60 * 24));
  }
  return diff;
}

let _toastTimer;
export function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('show'), 2500);
}

export function showLoading(show) {
  document.getElementById('loading-overlay').classList.toggle('show', show);
}

export function infoItems(pairs) {
  return pairs.map(([l, v]) =>
    `<div class="info-item"><label>${l}</label><p>${v || '—'}</p></div>`
  ).join('');
}

export function openModal(id)  { document.getElementById(id).classList.add('open'); }
export function closeModal(id) { document.getElementById(id).classList.remove('open'); }
