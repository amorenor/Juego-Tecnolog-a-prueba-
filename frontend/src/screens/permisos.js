import { db, sel } from '../state.js';
import { api } from '../api.js';
import { toast, openModal, closeModal } from '../utils.js';

const ALL_MODULES = [
  { id: 'home',     icon: '🏠', label: 'Inicio'   },
  { id: 'equipos',  icon: '👥', label: 'Equipos'  },
  { id: 'planner',  icon: '📋', label: 'Semana'   },
  { id: 'calendar', icon: '📅', label: 'Gerencia' },
  { id: 'permisos', icon: '🔐', label: 'Permisos' },
];

export function renderPermisos() {
  const list = document.getElementById('permisos-list');
  if (!db.users.length) {
    list.innerHTML = '<div class="empty"><div class="empty-icon">👤</div><p>Sin usuarios configurados</p></div>';
    return;
  }
  list.innerHTML = db.users.map(u => {
    const initials = u.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const team = u.teamId ? db.teams.find(t => t._id === u.teamId) : null;
    const mods = u.modules || [];
    return `<div class="user-row">
      <div class="avatar" style="width:44px;height:44px;font-size:.9rem;flex-shrink:0${u.role === 'manager' ? ';background:linear-gradient(135deg,#b45309,#fbbf24)' : ''}">${initials}</div>
      <div style="flex:1;min-width:0">
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:2px">
          <span style="font-weight:700;color:var(--text-bright);font-size:.95rem">${u.name}</span>
          <span class="urb ${u.role === 'manager' ? 'urb-manager' : 'urb-leader'}">${u.role === 'manager' ? 'Gerente' : 'Líder'}</span>
          ${team ? `<span style="font-size:.72rem;font-weight:600;color:${team.color}">${team.name}</span>` : ''}
        </div>
        <div style="font-size:.78rem;color:var(--text-muted);margin-bottom:10px">${u.email}</div>
        <div class="mod-pills">
          ${ALL_MODULES.map(m => `<span class="mod-pill${mods.includes(m.id) ? ' on' : ''}" onclick="toggleUserMod('${u._id}','${m.id}')">${m.icon} ${m.label}</span>`).join('')}
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px;flex-shrink:0">
        <button class="btn btn-sm btn-ghost" onclick="openUserForm('${u._id}')">✏ Editar</button>
        <button class="btn btn-sm btn-danger" onclick="deleteUser('${u._id}')">🗑</button>
      </div>
    </div>`;
  }).join('');
}

export async function toggleUserMod(userId, mod) {
  const u = db.users.find(x => x._id === userId);
  if (!u) return;
  const mods = [...(u.modules || [])];
  const idx = mods.indexOf(mod);
  if (idx >= 0) mods.splice(idx, 1);
  else mods.push(mod);
  try {
    const updated = await api.patchModules(userId, mods);
    const i = db.users.findIndex(x => x._id === userId);
    if (i >= 0) db.users[i] = updated;
    renderPermisos();
    toast('Permisos actualizados');
  } catch (err) {
    toast(err.message);
  }
}

export function openUserForm(userId) {
  const u = userId ? db.users.find(x => x._id === userId) : null;
  document.getElementById('user-form-title').textContent = u ? 'Editar Usuario' : 'Nuevo Usuario';
  document.getElementById('uf-id').value    = u?._id   || '';
  document.getElementById('uf-name').value  = u?.name  || '';
  document.getElementById('uf-email').value = u?.email || '';
  document.getElementById('uf-pass').value  = '';
  document.getElementById('uf-pass-hint').style.display = u ? '' : 'none';
  document.getElementById('uf-role').value  = u?.role  || 'leader';
  updateUfTeamWrap(u?.teamId);
  const mods = u?.modules || ['home', 'equipos', 'planner'];
  ALL_MODULES.forEach(m => {
    const cb = document.getElementById('uf-mod-' + m.id);
    if (cb) cb.checked = mods.includes(m.id);
  });
  openModal('modal-user');
}

export function updateUfTeamWrap(selectedTid) {
  const role = document.getElementById('uf-role').value;
  const wrap = document.getElementById('uf-team-wrap');
  wrap.style.display = role === 'leader' ? '' : 'none';
  const teamSel = document.getElementById('uf-team');
  teamSel.innerHTML = '<option value="">— Seleccionar —</option>' +
    db.teams.map(t => `<option value="${t._id}"${t._id === selectedTid ? ' selected' : ''}>${t.name}</option>`).join('');
}

export async function saveUser() {
  const id     = document.getElementById('uf-id').value;
  const name   = document.getElementById('uf-name').value.trim();
  const email  = document.getElementById('uf-email').value.trim().toLowerCase();
  const pass   = document.getElementById('uf-pass').value;
  const role   = document.getElementById('uf-role').value;
  const teamId = role === 'leader' ? (document.getElementById('uf-team').value || null) : null;

  if (!name || !email) { toast('Nombre y correo son obligatorios'); return; }
  if (!id && !pass)    { toast('La contraseña es obligatoria para un nuevo usuario'); return; }

  const mods = ALL_MODULES.map(m => m.id).filter(m => document.getElementById('uf-mod-' + m)?.checked);

  const data = { name, email, role, teamId, modules: mods };
  if (pass) data.password = pass;

  try {
    if (id) {
      const updated = await api.updateUser(id, data);
      const idx = db.users.findIndex(u => u._id === id);
      if (idx >= 0) db.users[idx] = updated;
    } else {
      const created = await api.createUser(data);
      db.users.push(created);
    }
    closeModal('modal-user');
    renderPermisos();
    toast('Usuario guardado');
  } catch (err) {
    toast(err.message);
  }
}

export async function deleteUser(userId) {
  if (!confirm('¿Eliminar este usuario? No podrá acceder a la aplicación.')) return;
  try {
    await api.deleteUser(userId);
    db.users = db.users.filter(u => u._id !== userId);
    renderPermisos();
    toast('Usuario eliminado');
  } catch (err) {
    toast(err.message);
  }
}

export function toggleUfPass() {
  const inp = document.getElementById('uf-pass');
  if (inp) inp.type = inp.type === 'password' ? 'text' : 'password';
}
