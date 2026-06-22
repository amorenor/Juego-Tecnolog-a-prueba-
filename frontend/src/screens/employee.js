import { db, sel } from '../state.js';
import { api } from '../api.js';
import { toast, fmtDate, calcAge, slugify, infoItems, openModal, closeModal } from '../utils.js';
import { renderEquiposPanels } from './equipos.js';

const COMMIT_KEYS = {
  objetivo:        'objetivos',
  conversacion:    'conversaciones',
  capacitacion:    'capacitaciones',
  reconocimiento:  'reconocimientos',
};

export function renderEmployee() {
  const e = db.employees.find(x => x._id === sel.currentEmpId);
  if (!e) return;
  const t        = db.teams.find(x => x._id === e.teamId);
  const initials = ((e.nombre || '?')[0] + (e.apellido || '')[0]).toUpperCase();

  document.getElementById('profile-hero').innerHTML = `
    <div class="profile-avatar">${initials}</div>
    <div>
      <div class="profile-name">${e.nombre} ${e.apellido}</div>
      <div class="profile-role">${e.cargo || 'Sin cargo definido'}</div>
      ${t ? `<span class="profile-team" style="background:${t.color}22;color:${t.color}">${t.name}</span>` : ''}
    </div>
    <div style="margin-left:auto;display:flex;gap:6px;">
      <button class="btn btn-sm btn-danger" onclick="deleteEmployee('${e._id}')">Eliminar</button>
    </div>
  `;

  document.getElementById('info-personal').innerHTML = infoItems([
    ['Nombre completo', `${e.nombre} ${e.apellido}`],
    ['RUT', e.rut], ['Email', e.email], ['Teléfono', e.tel],
    ['Fecha de nacimiento', e.nacimiento ? fmtDate(e.nacimiento) : '—'],
    ['Edad', e.nacimiento ? calcAge(e.nacimiento) + ' años' : '—'],
  ]);

  document.getElementById('info-familia').innerHTML = infoItems([
    ['Estado civil', e.estadoCivil], ['N° de hijos', e.hijos ?? '—'],
    ['Contacto emergencia', e.emergNombre], ['Tel. emergencia', e.emergTel],
  ]);

  document.getElementById('info-formacion').innerHTML = infoItems([
    ['Nivel educacional', e.educacion], ['Título / Profesión', e.titulo],
    ['Certificaciones', e.cert], ['Idiomas', e.idiomas],
  ]);

  document.getElementById('info-laboral').innerHTML = infoItems([
    ['Cargo', e.cargo], ['Tipo de contrato', e.contrato],
    ['Fecha de ingreso', e.ingreso ? fmtDate(e.ingreso) : '—'],
    ['Antigüedad', e.ingreso ? calcAge(e.ingreso) + ' años' : '—'],
    ['Centro de costo', e.ceco], ['Jornada', e.jornada],
    ['Equipo', t ? t.name : '—'],
  ]);

  renderCommitList('objetivos',       e.objetivos       || [], renderObjetivo);
  renderCommitList('conversaciones',  e.conversaciones  || [], renderConversacion);
  renderCommitList('capacitaciones',  e.capacitaciones  || [], renderCapacitacion);
  renderCommitList('reconocimientos', e.reconocimientos || [], renderReconocimiento);
}

function renderCommitList(type, items, renderFn) {
  const el = document.getElementById('list-' + type);
  if (!items.length) {
    el.innerHTML = '<div class="empty"><div class="empty-icon">📋</div><p>Sin registros aún</p></div>';
    return;
  }
  el.innerHTML = items.map(item => renderFn(item)).join('');
}

function renderObjetivo(o) {
  return `<div class="commit-item">
    <div class="commit-header">
      <div>
        <div class="commit-title">${o.titulo}</div>
        <div class="commit-meta">Vence: ${o.fechaLimite ? fmtDate(o.fechaLimite) : '—'}</div>
      </div>
      <div style="display:flex;gap:6px;align-items:center">
        <span class="status-chip status-${slugify(o.estado)}">${o.estado}</span>
        <button class="btn btn-sm btn-ghost" onclick="openCommitForm('objetivo','${o._id}')">✏</button>
        <button class="btn btn-sm btn-danger" onclick="deleteCommit('objetivos','${o._id}')">✕</button>
      </div>
    </div>
    ${o.descripcion ? `<div class="commit-body">${o.descripcion}</div>` : ''}
    <div class="progress-wrap">
      <div class="progress-lbl"><span>Avance</span><span>${o.progreso || 0}%</span></div>
      <div class="progress-bar"><div class="progress-fill" style="width:${o.progreso || 0}%"></div></div>
    </div>
  </div>`;
}

function renderConversacion(c) {
  return `<div class="commit-item">
    <div class="commit-header">
      <div>
        <div class="commit-title">${c.tipo || '1:1'} · ${c.fecha ? fmtDate(c.fecha) : '—'}</div>
        <div class="commit-meta">${c.proximaFecha ? 'Próxima: ' + fmtDate(c.proximaFecha) : ''}</div>
      </div>
      <div style="display:flex;gap:6px;">
        <button class="btn btn-sm btn-ghost" onclick="openCommitForm('conversacion','${c._id}')">✏</button>
        <button class="btn btn-sm btn-danger" onclick="deleteCommit('conversaciones','${c._id}')">✕</button>
      </div>
    </div>
    ${c.resumen ? `<div class="commit-body"><b>Resumen:</b> ${c.resumen}</div>` : ''}
    ${c.acuerdos ? `<div class="commit-body"><b>Acuerdos:</b> ${c.acuerdos}</div>` : ''}
  </div>`;
}

function renderCapacitacion(c) {
  return `<div class="commit-item">
    <div class="commit-header">
      <div>
        <div class="commit-title">${c.nombre}</div>
        <div class="commit-meta">${c.institucion || ''} · ${c.horas ? c.horas + ' hrs' : ''}</div>
      </div>
      <div style="display:flex;gap:6px;align-items:center">
        <span class="status-chip status-${slugify(c.estado)}">${c.estado}</span>
        <button class="btn btn-sm btn-ghost" onclick="openCommitForm('capacitacion','${c._id}')">✏</button>
        <button class="btn btn-sm btn-danger" onclick="deleteCommit('capacitaciones','${c._id}')">✕</button>
      </div>
    </div>
    ${c.fechaInicio ? `<div class="commit-meta" style="margin-top:6px">${fmtDate(c.fechaInicio)} → ${c.fechaFin ? fmtDate(c.fechaFin) : 'en curso'}</div>` : ''}
  </div>`;
}

function renderReconocimiento(r) {
  return `<div class="commit-item">
    <div class="commit-header">
      <div>
        <div class="commit-title">${r.tipo} · ${r.fecha ? fmtDate(r.fecha) : '—'}</div>
        <div class="commit-meta">${r.registradoPor ? 'Registrado por: ' + r.registradoPor : ''}</div>
      </div>
      <div style="display:flex;gap:6px;">
        <button class="btn btn-sm btn-ghost" onclick="openCommitForm('reconocimiento','${r._id}')">✏</button>
        <button class="btn btn-sm btn-danger" onclick="deleteCommit('reconocimientos','${r._id}')">✕</button>
      </div>
    </div>
    ${r.descripcion ? `<div class="commit-body">${r.descripcion}</div>` : ''}
  </div>`;
}

// ── Employee form ─────────────────────────────────────────────────────────────

export function openEmployeeForm(edit) {
  const e = edit ? db.employees.find(x => x._id === sel.currentEmpId) : null;
  document.getElementById('emp-form-title').textContent = e ? 'Editar Persona' : 'Nueva Persona';
  const fields = {
    'emp-id':           e?._id || '',
    'emp-nombre':       e?.nombre || '',
    'emp-apellido':     e?.apellido || '',
    'emp-rut':          e?.rut || '',
    'emp-nacimiento':   e?.nacimiento || '',
    'emp-email':        e?.email || '',
    'emp-tel':          e?.tel || '',
    'emp-estadocivil':  e?.estadoCivil || '',
    'emp-hijos':        e?.hijos ?? '',
    'emp-emerg-nombre': e?.emergNombre || '',
    'emp-emerg-tel':    e?.emergTel || '',
    'emp-educacion':    e?.educacion || '',
    'emp-titulo':       e?.titulo || '',
    'emp-cert':         e?.cert || '',
    'emp-idiomas':      e?.idiomas || '',
    'emp-cargo':        e?.cargo || '',
    'emp-ingreso':      e?.ingreso || '',
    'emp-contrato':     e?.contrato || '',
    'emp-ceco':         e?.ceco || '',
    'emp-jornada':      e?.jornada || '',
  };
  Object.entries(fields).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.value = val;
  });
  openModal('modal-employee');
}

export async function saveEmployee() {
  const id      = document.getElementById('emp-id').value;
  const nombre  = document.getElementById('emp-nombre').value.trim();
  const apellido = document.getElementById('emp-apellido').value.trim();
  if (!nombre || !apellido) { toast('Nombre y apellido son obligatorios'); return; }

  const data = {
    nombre, apellido,
    rut:         document.getElementById('emp-rut').value.trim(),
    nacimiento:  document.getElementById('emp-nacimiento').value,
    email:       document.getElementById('emp-email').value.trim(),
    tel:         document.getElementById('emp-tel').value.trim(),
    estadoCivil: document.getElementById('emp-estadocivil').value,
    hijos:       document.getElementById('emp-hijos').value,
    emergNombre: document.getElementById('emp-emerg-nombre').value.trim(),
    emergTel:    document.getElementById('emp-emerg-tel').value.trim(),
    educacion:   document.getElementById('emp-educacion').value,
    titulo:      document.getElementById('emp-titulo').value.trim(),
    cert:        document.getElementById('emp-cert').value.trim(),
    idiomas:     document.getElementById('emp-idiomas').value.trim(),
    cargo:       document.getElementById('emp-cargo').value.trim(),
    ingreso:     document.getElementById('emp-ingreso').value,
    contrato:    document.getElementById('emp-contrato').value,
    ceco:        document.getElementById('emp-ceco').value.trim(),
    jornada:     document.getElementById('emp-jornada').value,
  };

  try {
    if (id) {
      const updated = await api.updateEmployee(id, data);
      const idx = db.employees.findIndex(e => e._id === id);
      if (idx >= 0) db.employees[idx] = updated;
    } else {
      data.teamId = sel.currentTeamId;
      const created = await api.createEmployee(data);
      db.employees.push(created);
    }
    closeModal('modal-employee');
    renderEquiposPanels();
    if (id) renderEmployee();
    toast('Persona guardada');
  } catch (err) {
    toast(err.message);
  }
}

export async function deleteEmployee(eid) {
  if (!confirm('¿Eliminar esta persona y todos sus registros?')) return;
  try {
    await api.deleteEmployee(eid);
    db.employees = db.employees.filter(e => e._id !== eid);
    // Clear leadId if this employee was a team leader
    db.teams.forEach(t => { if (t.leadId === eid) t.leadId = ''; });
    document.getElementById('nav-emp').style.display = 'none';
    window.showScreen('equipos');
    window.setNav('nav-equipos');
    renderEquiposPanels();
    toast('Persona eliminada');
  } catch (err) {
    toast(err.message);
  }
}

// ── Commitment form ───────────────────────────────────────────────────────────

export function openCommitForm(type, editId) {
  sel.currentCommitType = type;
  sel.editingCommitId   = editId || null;
  const titles = { objetivo: 'Objetivo', conversacion: 'Conversación 1:1', capacitacion: 'Capacitación', reconocimiento: 'Reconocimiento / Sanción' };
  document.getElementById('commit-form-title').textContent = (editId ? 'Editar ' : 'Nuevo ') + titles[type];
  document.getElementById('commit-form-body').innerHTML = getCommitFormHTML(type, editId);
  openModal('modal-commit');
}

function getCommitFormHTML(type, editId) {
  const e    = db.employees.find(x => x._id === sel.currentEmpId);
  const key  = COMMIT_KEYS[type];
  const item = editId && e ? (e[key] || []).find(x => x._id === editId) : null;
  const v    = (f, def = '') => item ? (item[f] ?? def) : def;

  if (type === 'objetivo') return `
    <div class="field"><label>Título del objetivo</label><input type="text" id="cf-titulo" value="${v('titulo')}" placeholder="Ej: Certificar en AWS"/></div>
    <div class="field"><label>Descripción</label><textarea id="cf-desc">${v('descripcion')}</textarea></div>
    <div class="grid-2">
      <div class="field"><label>Fecha límite</label><input type="date" id="cf-fecha" value="${v('fechaLimite')}"/></div>
      <div class="field"><label>Estado</label>
        <select id="cf-estado">${['Pendiente', 'En curso', 'Completado', 'Cancelado'].map(s => `<option ${v('estado') === s ? 'selected' : ''}>${s}</option>`).join('')}</select>
      </div>
    </div>
    <div class="field"><label>Avance (${v('progreso', 0)}%)</label><input type="range" id="cf-prog" min="0" max="100" value="${v('progreso', 0)}" oninput="this.previousElementSibling.textContent='Avance ('+this.value+'%)'"/></div>
    <div style="display:flex;gap:8px;margin-top:16px;">
      <button class="btn btn-primary btn-full" onclick="saveCommit()">Guardar</button>
      <button class="btn btn-ghost" onclick="closeModal('modal-commit')">Cancelar</button>
    </div>`;

  if (type === 'conversacion') return `
    <div class="grid-2">
      <div class="field"><label>Fecha</label><input type="date" id="cf-fecha" value="${v('fecha')}"/></div>
      <div class="field"><label>Tipo</label>
        <select id="cf-tipo">${['Check-in', 'Feedback', 'Desarrollo', 'Seguimiento', 'Otro'].map(s => `<option ${v('tipo') === s ? 'selected' : ''}>${s}</option>`).join('')}</select>
      </div>
    </div>
    <div class="field"><label>Resumen</label><textarea id="cf-resumen">${v('resumen')}</textarea></div>
    <div class="field"><label>Acuerdos / Compromisos</label><textarea id="cf-acuerdos">${v('acuerdos')}</textarea></div>
    <div class="field"><label>Próxima reunión (opcional)</label><input type="date" id="cf-proxima" value="${v('proximaFecha')}"/></div>
    <div style="display:flex;gap:8px;margin-top:16px;">
      <button class="btn btn-primary btn-full" onclick="saveCommit()">Guardar</button>
      <button class="btn btn-ghost" onclick="closeModal('modal-commit')">Cancelar</button>
    </div>`;

  if (type === 'capacitacion') return `
    <div class="field"><label>Nombre</label><input type="text" id="cf-nombre" value="${v('nombre')}"/></div>
    <div class="field"><label>Institución</label><input type="text" id="cf-inst" value="${v('institucion')}"/></div>
    <div class="grid-2">
      <div class="field"><label>Inicio</label><input type="date" id="cf-inicio" value="${v('fechaInicio')}"/></div>
      <div class="field"><label>Término</label><input type="date" id="cf-fin" value="${v('fechaFin')}"/></div>
    </div>
    <div class="grid-2">
      <div class="field"><label>Horas</label><input type="number" id="cf-horas" value="${v('horas')}" min="0"/></div>
      <div class="field"><label>Estado</label>
        <select id="cf-estado">${['Pendiente', 'En curso', 'Completado', 'Cancelado'].map(s => `<option ${v('estado') === s ? 'selected' : ''}>${s}</option>`).join('')}</select>
      </div>
    </div>
    <div style="display:flex;gap:8px;margin-top:16px;">
      <button class="btn btn-primary btn-full" onclick="saveCommit()">Guardar</button>
      <button class="btn btn-ghost" onclick="closeModal('modal-commit')">Cancelar</button>
    </div>`;

  if (type === 'reconocimiento') return `
    <div class="grid-2">
      <div class="field"><label>Tipo</label>
        <select id="cf-tipo">${['Reconocimiento', 'Hito', 'Llamado de atención', 'Sanción'].map(s => `<option ${v('tipo') === s ? 'selected' : ''}>${s}</option>`).join('')}</select>
      </div>
      <div class="field"><label>Fecha</label><input type="date" id="cf-fecha" value="${v('fecha')}"/></div>
    </div>
    <div class="field"><label>Descripción</label><textarea id="cf-desc">${v('descripcion')}</textarea></div>
    <div class="field"><label>Registrado por</label><input type="text" id="cf-reg" value="${v('registradoPor')}"/></div>
    <div style="display:flex;gap:8px;margin-top:16px;">
      <button class="btn btn-primary btn-full" onclick="saveCommit()">Guardar</button>
      <button class="btn btn-ghost" onclick="closeModal('modal-commit')">Cancelar</button>
    </div>`;
}

export async function saveCommit() {
  const type = sel.currentCommitType;
  const key  = COMMIT_KEYS[type];
  const empId = sel.currentEmpId;
  const g = id => { const el = document.getElementById(id); return el ? el.value : ''; };

  let data;
  if (type === 'objetivo')
    data = { titulo: g('cf-titulo').trim(), descripcion: g('cf-desc').trim(), fechaLimite: g('cf-fecha'), estado: g('cf-estado'), progreso: parseInt(g('cf-prog')) || 0 };
  else if (type === 'conversacion')
    data = { fecha: g('cf-fecha'), tipo: g('cf-tipo'), resumen: g('cf-resumen').trim(), acuerdos: g('cf-acuerdos').trim(), proximaFecha: g('cf-proxima') };
  else if (type === 'capacitacion')
    data = { nome: g('cf-nombre').trim(), nombre: g('cf-nombre').trim(), institucion: g('cf-inst').trim(), fechaInicio: g('cf-inicio'), fechaFin: g('cf-fin'), horas: g('cf-horas'), estado: g('cf-estado') };
  else if (type === 'reconocimiento')
    data = { tipo: g('cf-tipo'), fecha: g('cf-fecha'), descripcion: g('cf-desc').trim(), registradoPor: g('cf-reg').trim() };

  try {
    let updatedEmp;
    if (sel.editingCommitId) {
      updatedEmp = await api.updateCommitment(empId, type, sel.editingCommitId, data);
    } else {
      updatedEmp = await api.addCommitment(empId, type, data);
    }
    const idx = db.employees.findIndex(e => e._id === empId);
    if (idx >= 0) db.employees[idx] = updatedEmp;
    closeModal('modal-commit');
    renderEmployee();
    toast('Guardado');
  } catch (err) {
    toast(err.message);
  }
}

export async function deleteCommit(key, cid) {
  if (!confirm('¿Eliminar este registro?')) return;
  const typeMap = { objetivos: 'objetivo', conversaciones: 'conversacion', capacitaciones: 'capacitacion', reconocimientos: 'reconocimiento' };
  const type = typeMap[key];
  try {
    const updatedEmp = await api.deleteCommitment(sel.currentEmpId, type, cid);
    const idx = db.employees.findIndex(e => e._id === sel.currentEmpId);
    if (idx >= 0) db.employees[idx] = updatedEmp;
    renderEmployee();
    toast('Eliminado');
  } catch (err) {
    toast(err.message);
  }
}

// ── Helpers for equipos quick actions ────────────────────────────────────────
export function addEmpToTeam(tid) {
  sel.currentTeamId = tid;
  openEmployeeForm(false);
}

export function openEmpEditFromEq(tid, eid) {
  sel.currentTeamId = tid;
  sel.currentEmpId  = eid;
  openEmployeeForm(true);
}

export function openCommitFromEq(eid, type) {
  sel.currentEmpId = eid;
  openCommitForm(type);
}

export function openEmployee(eid) {
  sel.currentEmpId = eid;
  document.getElementById('nav-emp').style.display = 'flex';
  window.showScreen('employee');
  window.setNav('nav-emp');
  document.querySelectorAll('.tab').forEach((t, i) => t.classList.toggle('active', i === 0));
  document.querySelectorAll('.tab-panel').forEach((p, i) => p.classList.toggle('active', i === 0));
  renderEmployee();
}

export function backToTeam() {
  document.getElementById('nav-emp').style.display = 'none';
  window.showScreen('equipos');
  window.setNav('nav-equipos');
}

export function filterMembers() {
  const q = (document.getElementById('member-search').value || '').toLowerCase();
  const members = db.employees.filter(e => e.teamId === sel.currentTeamId &&
    (!q || (e.nombre + ' ' + e.apellido + ' ' + (e.cargo || '')).toLowerCase().includes(q)));
  const grid = document.getElementById('members-grid');
  if (!members.length) {
    grid.innerHTML = '<div class="empty" style="grid-column:1/-1"><div class="empty-icon">👤</div><p>No hay personas en este equipo</p></div>';
    return;
  }
  const team = db.teams.find(t => t._id === sel.currentTeamId);
  grid.innerHTML = members.map(e => {
    const initials = ((e.nombre || '?')[0] + (e.apellido || '')[0]).toUpperCase();
    const pendObj  = (e.objetivos || []).filter(o => o.estado === 'Pendiente').length;
    const pendCap  = (e.capacitaciones || []).filter(c => c.estado === 'Pendiente').length;
    const isLead   = team && team.leadId === e._id;
    return `<div class="member-card${isLead ? ' member-leader' : ''}" onclick="openEmployee('${e._id}')">
      <div class="avatar">${isLead ? '👑' : initials}</div>
      <div class="member-info">
        <div class="member-name">${e.nombre} ${e.apellido}</div>
        <div class="member-role">${e.cargo || 'Sin cargo'}</div>
        <div class="member-badges">
          ${isLead ? `<span class="badge badge-leader">Líder</span>` : ''}
          ${pendObj ? `<span class="badge badge-pending">${pendObj} obj.</span>` : ''}
          ${pendCap ? `<span class="badge badge-pending">${pendCap} cap.</span>` : ''}
          ${(e.conversaciones || []).length ? `<span class="badge badge-info">${(e.conversaciones || []).length} 1:1</span>` : ''}
        </div>
      </div>
    </div>`;
  }).join('');
}

export function showTab(name, btn) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('tab-' + name).classList.add('active');
}
