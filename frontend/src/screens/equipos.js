import { db, sel } from '../state.js';
import { api } from '../api.js';
import { toast, openModal, closeModal } from '../utils.js';
import { getStoredUser } from '../auth.js';

export function renderEquipos() {
  const pillsEl = document.getElementById('eq-pills');
  pillsEl.innerHTML =
    `<div class="eq-pill${sel.eqPillActive === 'all' ? ' active' : ''}" data-tid="all" onclick="setEqPill('all')"
      style="${sel.eqPillActive === 'all' ? 'background:var(--accent);border-color:var(--accent);color:#fff' : ''}">Todos</div>` +
    db.teams.map(t =>
      `<div class="eq-pill${sel.eqPillActive === t._id ? ' active' : ''}" data-tid="${t._id}" onclick="setEqPill('${t._id}')"
        style="${sel.eqPillActive === t._id ? `background:${t.color};border-color:${t.color};color:#fff` : ''}">
        ${t.name}</div>`).join('');
  renderEquiposPanels();
}

export function setEqPill(tid) {
  sel.eqPillActive = tid;
  renderEquipos();
}

export function filterEquipos() {
  sel.eqFilter = (document.getElementById('eq-search-input').value || '').toLowerCase();
  renderEquiposPanels();
}

export function renderEquiposPanels() {
  const user        = getStoredUser();
  const isLeader    = user?.type === 'leader';
  const teamsToShow = sel.eqPillActive === 'all' ? db.teams : db.teams.filter(t => t._id === sel.eqPillActive);
  const panels      = document.getElementById('eq-panels');

  if (!teamsToShow.length) {
    panels.innerHTML = '<div class="empty"><div class="empty-icon">👥</div><p>Sin equipos</p></div>';
    return;
  }

  const today = new Date(); today.setHours(0, 0, 0, 0);

  panels.innerHTML = teamsToShow.map(t => {
    const allMembers = db.employees.filter(e => e.teamId === t._id);
    const members    = allMembers.filter(e =>
      !sel.eqFilter || (e.nombre + ' ' + e.apellido + ' ' + (e.cargo || '')).toLowerCase().includes(sel.eqFilter));
    const leader  = t.leadId ? db.employees.find(e => e._id === t.leadId) : null;
    const canEdit = !isLeader || user.teamId === t._id;

    const empCards = members.map(e => {
      const initials  = ((e.nombre || '?')[0] + (e.apellido || '')[0]).toUpperCase();
      const isLead    = t.leadId === e._id;
      const pendObj   = (e.objetivos || []).filter(o => o.estado === 'Pendiente').length;
      const pendCap   = (e.capacitaciones || []).filter(c => c.estado === 'Pendiente').length;
      const convs     = (e.conversaciones || []).filter(c => c.fecha).sort((a, b) => b.fecha.localeCompare(a.fecha));
      const daysSince = convs[0] ? Math.round((today - new Date(convs[0].fecha + 'T00:00:00')) / (1000 * 60 * 60 * 24)) : null;
      const convOld   = daysSince !== null && daysSince >= 30;

      const badges = [
        isLead    ? `<span class="emp-card-badge ecb-info">👑 Líder</span>` : '',
        pendObj   ? `<span class="emp-card-badge ecb-warn">⚠ ${pendObj} obj</span>` : '',
        pendCap   ? `<span class="emp-card-badge ecb-warn">📚 ${pendCap} cap</span>` : '',
        convOld   ? `<span class="emp-card-badge ecb-danger">💬 ${daysSince}d sin 1:1</span>` :
          (convs.length ? `<span class="emp-card-badge ecb-ok">💬 ${convs.length} 1:1</span>` : ''),
      ].filter(Boolean).join('');

      const actions = canEdit ? `<div class="emp-card-actions">
        <button class="emp-card-action" onclick="event.stopPropagation();openEmpEditFromEq('${t._id}','${e._id}')">✏ Editar</button>
        <button class="emp-card-action" onclick="event.stopPropagation();openCommitFromEq('${e._id}','objetivo')">🎯 Obj</button>
        <button class="emp-card-action" onclick="event.stopPropagation();openCommitFromEq('${e._id}','conversacion')">💬 1:1</button>
      </div>` : '';

      return `<div class="emp-card" style="--team-color:${t.color}" onclick="openEmployee('${e._id}')">
        <div class="emp-card-top">
          <div class="emp-card-av${isLead ? ' is-leader' : ''}">${isLead ? '👑' : initials}</div>
          <div style="min-width:0">
            <div class="emp-card-name">${e.nombre} ${e.apellido}</div>
            <div class="emp-card-role">${e.cargo || 'Sin cargo'}</div>
          </div>
        </div>
        ${badges ? `<div class="emp-card-badges">${badges}</div>` : ''}
        ${actions}
      </div>`;
    }).join('');

    const bodyContent = members.length
      ? `<div class="emp-cards-grid">${empCards}</div>`
      : `<div class="empty" style="padding:20px"><p>${sel.eqFilter ? 'Sin resultados' : 'Sin personas en este equipo'}</p></div>`;

    return `<div class="team-panel" style="--team-color:${t.color}" id="panel-${t._id}">
      <div class="team-panel-hdr">
        <div class="team-panel-hdr-left">
          <div class="team-panel-dot"></div>
          <div class="team-panel-name">${t.name}</div>
          <span class="team-panel-count">${allMembers.length} persona${allMembers.length !== 1 ? 's' : ''}</span>
          ${leader ? `<span class="team-panel-leader">👑 ${leader.nombre} ${leader.apellido}</span>` : ''}
        </div>
        <div class="team-panel-actions">
          ${canEdit ? `<button class="btn btn-sm btn-ghost" onclick="editTeamFromEq('${t._id}')">Editar equipo</button>` : ''}
          ${canEdit ? `<button class="btn btn-sm btn-primary" onclick="addEmpToTeam('${t._id}')">+ Persona</button>` : ''}
        </div>
      </div>
      <div class="team-panel-body">${bodyContent}</div>
    </div>`;
  }).join('');
}

// ── Team form ─────────────────────────────────────────────────────────────────

export function openTeamForm(edit) {
  const t = edit ? db.teams.find(x => x._id === sel.currentTeamId) : null;
  document.getElementById('team-form-title').textContent = t ? 'Editar Equipo' : 'Nuevo Equipo';
  document.getElementById('team-id').value       = t ? t._id  : '';
  document.getElementById('team-name').value     = t ? t.name : '';
  document.getElementById('team-color').value    = t ? t.color : '#3b9eff';
  document.getElementById('team-desc').value     = t ? t.desc  : '';

  const leadSel  = document.getElementById('team-lead');
  const leadHint = document.getElementById('team-lead-hint');
  const members  = t ? db.employees.filter(e => e.teamId === t._id) : [];
  leadSel.innerHTML = '<option value="">— Sin líder —</option>';
  if (!t || !members.length) {
    leadSel.disabled        = true;
    leadHint.style.display  = 'block';
  } else {
    leadSel.disabled        = false;
    leadHint.style.display  = 'none';
    members.forEach(m => {
      const opt = document.createElement('option');
      opt.value       = m._id;
      opt.textContent = `${m.nombre} ${m.apellido}${m.cargo ? ' · ' + m.cargo : ''}`;
      if (t.leadId === m._id) opt.selected = true;
      leadSel.appendChild(opt);
    });
  }
  openModal('modal-team');
}

export async function saveTeam() {
  const id    = document.getElementById('team-id').value;
  const name  = document.getElementById('team-name').value.trim();
  if (!name) { toast('El nombre es obligatorio'); return; }

  const data = {
    name,
    color:  document.getElementById('team-color').value,
    leadId: document.getElementById('team-lead').value,
    desc:   document.getElementById('team-desc').value.trim(),
  };

  try {
    if (id) {
      const updated = await api.updateTeam(id, data);
      const idx = db.teams.findIndex(t => t._id === id);
      if (idx >= 0) db.teams[idx] = updated;
    } else {
      const created = await api.createTeam(data);
      db.teams.push(created);
    }
    closeModal('modal-team');
    window.renderHome?.();
    renderEquiposPanels();
    toast('Equipo guardado');
  } catch (err) {
    toast(err.message);
  }
}

export function editTeamFromEq(tid) {
  sel.currentTeamId = tid;
  openTeamForm(true);
}

export function editCurrentTeam() {
  openTeamForm(true);
}
