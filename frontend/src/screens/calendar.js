import { db, sel } from '../state.js';
import { HOLIDAYS, toDs, fmtDate, openModal } from '../utils.js';

const MNAMES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

export function renderCalendar() {
  const isWork = sel.calViewMode === 'work';
  const DNAMES = isWork ? ['Lun','Mar','Mié','Jue','Vie'] : ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
  const cols = isWork ? 5 : 7;

  document.getElementById('cal-month-label').textContent = `${MNAMES[sel.calMonth]} ${sel.calYear}`;
  document.getElementById('cal-header').style.gridTemplateColumns = `repeat(${cols},1fr)`;
  document.getElementById('cal-grid').style.gridTemplateColumns = `repeat(${cols},1fr)`;
  document.getElementById('cal-header').innerHTML = DNAMES.map(d => `<div class="cal-header-cell">${d}</div>`).join('');

  document.getElementById('cal-btn-full').className = `btn btn-sm ${isWork ? 'btn-ghost' : 'btn-primary'}`;
  document.getElementById('cal-btn-work').className = `btn btn-sm ${isWork ? 'btn-primary' : 'btn-ghost'}`;

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayDs = toDs(today);
  const firstDow = new Date(sel.calYear, sel.calMonth, 1).getDay();
  const startOffset = firstDow === 0 ? 6 : firstDow - 1;
  const daysInMonth = new Date(sel.calYear, sel.calMonth + 1, 0).getDate();
  const prevM = sel.calMonth === 0 ? 11 : sel.calMonth - 1;
  const prevY = sel.calMonth === 0 ? sel.calYear - 1 : sel.calYear;
  const dInPrev = new Date(prevY, prevM + 1, 0).getDate();
  const nextM = sel.calMonth === 11 ? 0 : sel.calMonth + 1;
  const nextY = sel.calMonth === 11 ? sel.calYear + 1 : sel.calYear;

  const full = [];
  for (let i = startOffset - 1; i >= 0; i--) full.push({ ds: toDs(new Date(prevY, prevM, dInPrev - i)), other: true });
  for (let d = 1; d <= daysInMonth; d++) full.push({ ds: toDs(new Date(sel.calYear, sel.calMonth, d)), other: false });
  let nd = 1;
  while (full.length < 42) full.push({ ds: toDs(new Date(nextY, nextM, nd++)), other: true });

  const cells = isWork ? full.filter((_, i) => i % 7 < 5) : full;

  document.getElementById('cal-grid').innerHTML = cells.map(({ ds, other }) => {
    const d = new Date(ds + 'T12:00:00');
    const we = d.getDay() === 0 || d.getDay() === 6;
    const hw = HOLIDAYS[ds];
    const isT = ds === todayDs;
    let cls = 'cal-day';
    if (other) cls += ' other-month';
    else {
      if (we) cls += ' weekend';
      if (hw) cls += ' holiday';
      if (isT) cls += ' today';
    }
    const att = db.attendance.filter(a => a.date === ds);
    const tele = att.filter(a => a.type === 'teletrabajo');
    const vac  = att.filter(a => a.type === 'vacaciones');
    const comp = att.filter(a => a.type === 'compensado');
    return `<div class="${cls}" onclick="showDayDetail('${ds}')">
      <div class="cal-num">${d.getDate()}</div>
      ${hw ? `<div class="cal-hday">${hw}</div>` : ''}
      <div class="cal-chips">
        ${tele.length ? `<div class="cal-chip cal-chip-T">💻 ${tele.length} teletrabajo</div>` : ''}
        ${vac.length  ? `<div class="cal-chip cal-chip-V">🌴 ${vac.length} vacaciones</div>` : ''}
        ${comp.length ? `<div class="cal-chip cal-chip-C">📅 ${comp.length} compensado</div>` : ''}
      </div>
    </div>`;
  }).join('');
}

export function setCalView(mode) {
  sel.calViewMode = mode;
  renderCalendar();
}

export function changeMonth(dir) {
  sel.calMonth += dir;
  if (sel.calMonth > 11) { sel.calMonth = 0; sel.calYear++; }
  if (sel.calMonth < 0)  { sel.calMonth = 11; sel.calYear--; }
  renderCalendar();
}

export function showDayDetail(ds) {
  if (!ds) return;
  const hw = HOLIDAYS[ds];
  const dow = new Date(ds + 'T12:00:00').getDay();
  const weStr = dow === 0 ? 'Domingo' : dow === 6 ? 'Sábado' : '';
  document.getElementById('day-modal-title').textContent =
    `${fmtDate(ds)}${weStr ? ' · ' + weStr : ''}${hw ? ' · ' + hw : ''}`;

  const att = db.attendance.filter(a => a.date === ds);
  const types = [
    { key: 'teletrabajo', label: 'Teletrabajo',      icon: '💻' },
    { key: 'vacaciones',  label: 'Vacaciones',        icon: '🌴' },
    { key: 'compensado',  label: 'Días Compensados',  icon: '📅' },
  ];

  let html = '';
  types.forEach(({ key, label, icon }) => {
    const items = att.filter(a => a.type === key);
    if (!items.length) return;
    html += `<div class="section-lbl" style="margin-top:${html ? '16px' : '0'}">${icon} ${label} (${items.length})</div>`;
    html += items.map(a => {
      const emp  = db.employees.find(e => e._id === a.empId);
      const team = db.teams.find(t => t._id === a.teamId);
      return `<div style="display:flex;justify-content:space-between;align-items:flex-start;padding:8px 0;border-bottom:1px solid var(--border2)">
        <div>
          <div style="font-size:.88rem;font-weight:600;color:var(--text-bright)">${emp ? emp.nombre + ' ' + emp.apellido : '—'}</div>
          <div style="font-size:.75rem;color:var(--text-muted)">${emp?.cargo || ''}${team ? ` · <span style="color:${team.color}">${team.name}</span>` : ''}</div>
          ${a.motivo ? `<div style="font-size:.75rem;color:var(--warning);margin-top:2px">📝 ${a.motivo}</div>` : ''}
        </div>
      </div>`;
    }).join('');
  });

  if (!html) html = '<div class="empty"><div class="empty-icon">📭</div><p>Sin registros para este día</p></div>';
  document.getElementById('day-modal-body').innerHTML = html;
  openModal('modal-day');
}
