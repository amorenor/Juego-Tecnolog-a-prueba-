import { db, sel } from '../state.js';
import { api } from '../api.js';
import { toast, fmtDate, toDs, isWorkday, isWeekend, isHoliday, HOLIDAYS, getMondayOf, weekDates, openModal, closeModal } from '../utils.js';
import { getStoredUser } from '../auth.js';

export function renderPlanner() {
  if (!sel.plannerWeek) sel.plannerWeek = getMondayOf(new Date());

  const user     = getStoredUser();
  const isLeader = user?.type === 'leader';
  if (isLeader) sel.plannerTeam = user.teamId;

  // User badge
  const badge = document.getElementById('planner-user-badge');
  if (user) {
    const team = db.teams.find(t => t._id === user.teamId);
    badge.innerHTML = `<div class="user-badge">
      ${isLeader ? '👥' : '⭐'} Ingresando como <strong>${user.name}</strong>
      ${isLeader && team ? `<span style="color:${team.color}"> · ${team.name}</span>` : ''}
      <button onclick="doLogout()" title="Salir">Salir</button>
    </div>`;
  }

  const dates  = weekDates(sel.plannerWeek);
  const DNAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const d0 = new Date(dates[0] + 'T12:00:00');
  const d6 = new Date(dates[6] + 'T12:00:00');
  document.getElementById('week-label').textContent =
    `${d0.getDate()} ${MONTHS[d0.getMonth()]} – ${d6.getDate()} ${MONTHS[d6.getMonth()]} ${d6.getFullYear()}`;

  const hdaysThisWeek = dates.filter(d => HOLIDAYS[d]);
  document.getElementById('holiday-alert').innerHTML = hdaysThisWeek.map(d =>
    `<div style="padding:6px 10px;margin-bottom:6px;font-size:.78rem;background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2);border-radius:var(--r-sm);color:var(--danger)">
      🎌 <b>${HOLIDAYS[d]}</b> — ${fmtDate(d)}</div>`).join('');

  // Tabs (manager only)
  const tabsEl = document.getElementById('planner-tabs');
  if (isLeader) {
    tabsEl.innerHTML = '';
  } else {
    tabsEl.innerHTML =
      `<div class="team-tab${sel.plannerTeam === 'all' ? ' active' : ''}" onclick="setPlannerTeam('all')">Todos los equipos</div>` +
      db.teams.map(t =>
        `<div class="team-tab${sel.plannerTeam === t._id ? ' active' : ''}" onclick="setPlannerTeam('${t._id}')"
          style="${sel.plannerTeam === t._id ? `border-color:${t.color};color:${t.color}` : ''}">${t.name}</div>`).join('');
  }

  const emps = sel.plannerTeam === 'all'
    ? [...db.employees]
    : db.employees.filter(e => e.teamId === sel.plannerTeam);
  emps.sort((a, b) => (a.teamId + a.apellido).localeCompare(b.teamId + b.apellido));
  const readonly = user?.type === 'manager';

  if (!emps.length) {
    document.getElementById('planner-table').innerHTML =
      '<tr><td style="text-align:center;padding:32px;color:var(--text-muted)">Sin personas para mostrar</td></tr>';
    return;
  }

  const thead = `<thead><tr>
    <th class="col-name">Persona</th>
    ${dates.map((d, i) => {
      const hw = HOLIDAYS[d], we = isWeekend(d);
      return `<th class="${hw ? 'col-holiday' : we ? 'col-weekend' : ''}">${DNAMES[i]}<br>
        <span style="font-weight:400;font-size:.78em">${d.split('-')[2]}</span>
        ${hw ? `<br><span style="font-size:.6em;font-weight:400">${hw.split(' ').slice(0, 2).join(' ')}</span>` : ''}
      </th>`;
    }).join('')}
  </tr></thead>`;

  const tbody = emps.map(e => {
    const team  = db.teams.find(t => t._id === e.teamId);
    const cells = dates.map(d => {
      const wd  = isWorkday(d), we = isWeekend(d), hd = !!HOLIDAYS[d];
      const sT  = getAtt(e._id, d, 'teletrabajo');
      const sV  = getAtt(e._id, d, 'vacaciones');
      const sC  = getAtt(e._id, d, 'compensado');
      const dow   = new Date(d + 'T12:00:00').getDay();
      const limit = dow === 5 ? 1 : 2;
      const teamTele = db.attendance.filter(a => a.type === 'teletrabajo' && a.date === d && a.teamId === e.teamId && a.empId !== e._id).length;
      const tBlocked = !wd || !!sV || !!sC || (!sT && teamTele >= limit);
      const cBlocked = !wd || !!sV;
      const bg = (we || hd) ? 'background:var(--surface3)' : '';
      const clickT = !readonly ? `onclick="toggleAtt('${e._id}','${d}','teletrabajo')"` : '';
      const clickV = !readonly ? `onclick="toggleAtt('${e._id}','${d}','vacaciones')"` : '';
      const clickC = !readonly ? `onclick="toggleAtt('${e._id}','${d}','compensado')"` : '';
      return `<td style="${bg}${readonly ? ' opacity:.85' : ''}">
        <div class="day-btns">
          <button class="day-btn${sT ? ' on-T' : ''}" ${(tBlocked && !sT) || readonly ? 'disabled' : ''} ${clickT} title="Teletrabajo">T</button>
          <button class="day-btn${sV ? ' on-V' : ''}" ${(!we && !isHoliday(d)) || sV ? '' : 'disabled'} ${readonly ? 'disabled' : ''} ${clickV} title="Vacaciones">V</button>
          <button class="day-btn${sC ? ' on-C' : ''}" ${(cBlocked && !sC) || readonly ? 'disabled' : ''} ${clickC} title="Compensado">C</button>
        </div>
        ${sC && sC.motivo ? `<div style="font-size:.58rem;color:var(--warning);text-align:center;margin-top:2px">${sC.motivo.slice(0, 18)}${sC.motivo.length > 18 ? '…' : ''}</div>` : ''}
      </td>`;
    }).join('');
    return `<tr>
      <td class="col-name">
        <div class="p-name">${e.nombre} ${e.apellido}</div>
        <div class="p-role">${e.cargo || ''}${team ? ` · <span style="color:${team.color}">${team.name}</span>` : ''}</div>
      </td>${cells}
    </tr>`;
  }).join('');

  document.getElementById('planner-table').innerHTML = thead + `<tbody>${tbody}</tbody>`;
}

export function setPlannerTeam(id) { sel.plannerTeam = id; renderPlanner(); }

export function changeWeek(dir) {
  const w = new Date(sel.plannerWeek);
  w.setDate(w.getDate() + dir * 7);
  sel.plannerWeek = w;
  renderPlanner();
}

function getAtt(empId, date, type) {
  return db.attendance.find(a => a.empId === empId && a.date === date && a.type === type) || null;
}

export async function toggleAtt(empId, date, type) {
  const existing = getAtt(empId, date, type);

  if (type === 'compensado') {
    if (existing) {
      try {
        await api.deleteAttendance(existing._id);
        db.attendance = db.attendance.filter(a => a._id !== existing._id);
        renderPlanner();
      } catch (err) { toast(err.message); }
      return;
    }
    sel.pendingComp = { empId, date };
    document.getElementById('comp-motivo').value = '';
    const emp = db.employees.find(e => e._id === empId);
    document.getElementById('comp-modal-title').textContent =
      `Compensado · ${emp ? emp.nombre + ' ' + emp.apellido : ''} · ${fmtDate(date)}`;
    openModal('modal-compensado');
    return;
  }

  if (existing) {
    try {
      await api.deleteAttendance(existing._id);
      db.attendance = db.attendance.filter(a => a._id !== existing._id);
      renderPlanner();
    } catch (err) { toast(err.message); }
  } else {
    const emp    = db.employees.find(e => e._id === empId);
    const teamId = emp?.teamId;
    try {
      const record = await api.createAttendance({ empId, teamId, date, type, motivo: '' });
      // Remove any replaced records (server deletes conflicting types)
      db.attendance = db.attendance.filter(a => !(a.empId === empId && a.date === date));
      db.attendance.push(record);
      renderPlanner();
    } catch (err) {
      toast(err.message);
    }
  }
}

export async function saveCompensado() {
  const motivo = document.getElementById('comp-motivo').value.trim();
  if (!motivo) { toast('Escribe el motivo del día compensado'); return; }
  const { empId, date } = sel.pendingComp;
  const emp = db.employees.find(e => e._id === empId);
  try {
    const record = await api.createAttendance({ empId, teamId: emp?.teamId, date, type: 'compensado', motivo });
    db.attendance = db.attendance.filter(a => !(a.empId === empId && a.date === date));
    db.attendance.push(record);
    closeModal('modal-compensado');
    sel.pendingComp = null;
    renderPlanner();
    toast('Día compensado guardado');
  } catch (err) {
    toast(err.message);
  }
}

export function cancelCompensado() {
  sel.pendingComp = null;
  closeModal('modal-compensado');
}
