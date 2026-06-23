import { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { api } from '../api/index.js';
import Modal from '../components/Modal.jsx';

const ALL_MODULES = [
  { id: 'home',     icon: '🏠', label: 'Inicio'   },
  { id: 'equipos',  icon: '👥', label: 'Equipos'  },
  { id: 'planner',  icon: '📋', label: 'Semana'   },
  { id: 'calendar', icon: '📅', label: 'Gerencia' },
  { id: 'permisos', icon: '🔐', label: 'Permisos' },
];

function UserForm({ userId, onClose, onSaved }) {
  const { db, setDb, toast } = useApp();
  const u = userId ? db.users.find(x => x._id === userId) : null;
  const [name,   setName]   = useState(u?.name || '');
  const [email,  setEmail]  = useState(u?.email || '');
  const [pass,   setPass]   = useState('');
  const [showPass, setShowPass] = useState(false);
  const [role,   setRole]   = useState(u?.role || 'leader');
  const [teamId, setTeamId] = useState(u?.teamId || '');
  const [mods,   setMods]   = useState(u?.modules || ['home','equipos','planner']);
  const [saving, setSaving] = useState(false);

  function toggleMod(id) {
    setMods(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
  }

  async function save() {
    if (!name.trim() || !email.trim()) { toast('Nombre y correo son obligatorios'); return; }
    if (!userId && !pass) { toast('La contraseña es obligatoria para un nuevo usuario'); return; }
    setSaving(true);
    const data = { name: name.trim(), email: email.trim().toLowerCase(), role, teamId: role === 'leader' ? teamId || null : null, modules: mods };
    if (pass) data.password = pass;
    try {
      if (userId) {
        const updated = await api.updateUser(userId, data);
        setDb(prev => ({ ...prev, users: prev.users.map(x => x._id === userId ? updated : x) }));
      } else {
        const created = await api.createUser(data);
        setDb(prev => ({ ...prev, users: [...prev.users, created] }));
      }
      toast('Usuario guardado'); onSaved();
    } catch (err) { toast(err.message); }
    finally { setSaving(false); }
  }

  const inp = "w-full rounded-xl px-4 py-2.5 text-sm outline-none";
  const inpStyle = { background: 'var(--surface2)', border: '1px solid var(--border2)', color: 'var(--text-bright)' };
  const Field = ({ label, children }) => (
    <div className="mb-4">
      <label className="block text-xs font-semibold tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>{label}</label>
      {children}
    </div>
  );

  return (
    <>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Field label="NOMBRE">
          <input className={inp} style={inpStyle} value={name} onChange={e => setName(e.target.value)} />
        </Field>
        <Field label="CORREO">
          <input type="email" className={inp} style={inpStyle} value={email} onChange={e => setEmail(e.target.value)} />
        </Field>
      </div>
      <Field label={`CONTRASEÑA${userId ? ' (vacío = sin cambio)' : ''}`}>
        <div className="relative">
          <input type={showPass ? 'text' : 'password'} className={`${inp} pr-16`} style={inpStyle} value={pass} onChange={e => setPass(e.target.value)} placeholder="Nueva contraseña" />
          <button type="button" onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--text-muted)' }}>Mostrar</button>
        </div>
      </Field>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Field label="ROL">
          <select className={inp} style={inpStyle} value={role} onChange={e => setRole(e.target.value)}>
            <option value="manager">Gerente / Admin</option>
            <option value="leader">Líder de equipo</option>
          </select>
        </Field>
        {role === 'leader' && (
          <Field label="EQUIPO">
            <select className={inp} style={inpStyle} value={teamId} onChange={e => setTeamId(e.target.value)}>
              <option value="">— Seleccionar —</option>
              {db.teams.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>
          </Field>
        )}
      </div>
      <div className="mb-4">
        <div className="text-xs font-semibold tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>MÓDULOS HABILITADOS</div>
        <div className="flex flex-wrap gap-2">
          {ALL_MODULES.map(m => (
            <button key={m.id} onClick={() => toggleMod(m.id)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
              style={mods.includes(m.id)
                ? { background: 'rgba(59,158,255,.2)', border: '1px solid var(--accent)', color: 'var(--accent)' }
                : { background: 'var(--surface2)', border: '1px solid var(--border2)', color: 'var(--text-muted)' }}>
              {m.icon} {m.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-2 mt-2">
        <button onClick={save} disabled={saving} className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white disabled:opacity-60"
          style={{ background: 'var(--accent)' }}>{saving ? 'Guardando…' : 'Guardar'}</button>
        <button onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm"
          style={{ background: 'var(--surface2)', color: 'var(--text-muted)' }}>Cancelar</button>
      </div>
    </>
  );
}

export default function Permisos() {
  const { db, setDb, toast } = useApp();
  const [userModal, setUserModal] = useState(null); // null | 'new' | userId

  async function toggleMod(userId, mod) {
    const u = db.users.find(x => x._id === userId);
    if (!u) return;
    const mods = u.modules.includes(mod) ? u.modules.filter(m => m !== mod) : [...u.modules, mod];
    try {
      const updated = await api.patchModules(userId, mods);
      setDb(prev => ({ ...prev, users: prev.users.map(x => x._id === userId ? updated : x) }));
      toast('Permisos actualizados');
    } catch (err) { toast(err.message); }
  }

  async function deleteUser(userId) {
    if (!confirm('¿Eliminar este usuario?')) return;
    try {
      await api.deleteUser(userId);
      setDb(prev => ({ ...prev, users: prev.users.filter(u => u._id !== userId) }));
      toast('Usuario eliminado');
    } catch (err) { toast(err.message); }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-24">
      <div className="flex items-center justify-between mb-6">
        <div className="text-xl font-black" style={{ color: 'var(--text-bright)' }}>🔐 Permisos de Acceso</div>
        <button onClick={() => setUserModal('new')} className="text-sm px-4 py-2 rounded-xl font-semibold text-white"
          style={{ background: 'var(--accent)' }}>+ Nuevo usuario</button>
      </div>

      {db.users.length === 0
        ? <div className="text-center py-12 text-sm" style={{ color: 'var(--text-muted)' }}>👤 Sin usuarios configurados</div>
        : db.users.map(u => {
          const initials = u.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
          const team = u.teamId ? db.teams.find(t => t._id === u.teamId) : null;
          return (
            <div key={u._id} className="rounded-2xl p-4 mb-3 flex gap-3"
              style={{ background: 'var(--surface)', border: '1px solid var(--border2)' }}>
              <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                style={{ background: u.role === 'manager' ? 'linear-gradient(135deg,#b45309,#fbbf24)' : 'var(--surface2)', color: 'var(--text-bright)' }}>
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="font-bold text-sm" style={{ color: 'var(--text-bright)' }}>{u.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                    style={u.role === 'manager'
                      ? { background: 'rgba(180,83,9,.2)', color: '#fbbf24' }
                      : { background: 'rgba(59,158,255,.15)', color: 'var(--accent)' }}>
                    {u.role === 'manager' ? 'Gerente' : 'Líder'}
                  </span>
                  {team && <span className="text-xs font-semibold" style={{ color: team.color }}>{team.name}</span>}
                </div>
                <div className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>{u.email}</div>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_MODULES.map(m => (
                    <button key={m.id} onClick={() => toggleMod(u._id, m.id)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
                      style={(u.modules || []).includes(m.id)
                        ? { background: 'rgba(59,158,255,.2)', border: '1px solid var(--accent)', color: 'var(--accent)' }
                        : { background: 'var(--surface2)', border: '1px solid var(--border2)', color: 'var(--text-muted)' }}>
                      {m.icon} {m.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2 flex-shrink-0">
                <button onClick={() => setUserModal(u._id)}
                  className="text-xs px-3 py-1.5 rounded-lg"
                  style={{ background: 'var(--surface2)', color: 'var(--text-muted)', border: '1px solid var(--border2)' }}>✏ Editar</button>
                <button onClick={() => deleteUser(u._id)}
                  className="text-xs px-3 py-1.5 rounded-lg"
                  style={{ background: 'rgba(239,68,68,.1)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,.2)' }}>🗑</button>
              </div>
            </div>
          );
        })
      }

      {userModal !== null && (
        <Modal title={userModal === 'new' ? 'Nuevo Usuario' : 'Editar Usuario'} onClose={() => setUserModal(null)}>
          <UserForm userId={userModal === 'new' ? null : userModal} onClose={() => setUserModal(null)} onSaved={() => setUserModal(null)} />
        </Modal>
      )}
    </div>
  );
}
