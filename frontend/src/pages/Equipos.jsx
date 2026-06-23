import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { api } from '../api/index.js';
import Modal from '../components/Modal.jsx';

function TeamForm({ teamId, onClose, onSaved }) {
  const { db, setDb, toast } = useApp();
  const team = teamId ? db.teams.find(t => t._id === teamId) : null;
  const members = team ? db.employees.filter(e => e.teamId === team._id) : [];
  const [name, setName]   = useState(team?.name || '');
  const [color, setColor] = useState(team?.color || '#3b9eff');
  const [leadId, setLeadId] = useState(team?.leadId || '');
  const [desc, setDesc]   = useState(team?.desc || '');
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!name.trim()) { toast('El nombre es obligatorio'); return; }
    setSaving(true);
    try {
      const data = { name: name.trim(), color, leadId, desc: desc.trim() };
      if (teamId) {
        const updated = await api.updateTeam(teamId, data);
        setDb(prev => ({ ...prev, teams: prev.teams.map(t => t._id === teamId ? updated : t) }));
      } else {
        const created = await api.createTeam(data);
        setDb(prev => ({ ...prev, teams: [...prev.teams, created] }));
      }
      toast('Equipo guardado'); onSaved();
    } catch (err) { toast(err.message); }
    finally { setSaving(false); }
  }

  const COLORS = ['#3b9eff','#22c55e','#f59e0b','#a855f7','#ef4444'];
  const Field = ({ label, children }) => (
    <div className="mb-4">
      <label className="block text-xs font-semibold tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>{label}</label>
      {children}
    </div>
  );
  const inp = "w-full rounded-xl px-4 py-2.5 text-sm outline-none";
  const inpStyle = { background: 'var(--surface2)', border: '1px solid var(--border2)', color: 'var(--text-bright)' };

  return (
    <>
      <Field label="NOMBRE">
        <input className={inp} style={inpStyle} value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Infraestructura…" />
      </Field>
      <Field label="COLOR">
        <div className="flex gap-2">
          {COLORS.map(c => (
            <button key={c} onClick={() => setColor(c)}
              className="w-8 h-8 rounded-full transition-all"
              style={{ background: c, border: color === c ? '3px solid white' : '2px solid transparent', transform: color === c ? 'scale(1.15)' : 'scale(1)' }} />
          ))}
        </div>
      </Field>
      <Field label="LÍDER DE EQUIPO">
        <select className={inp} style={inpStyle} value={leadId} onChange={e => setLeadId(e.target.value)} disabled={!members.length}>
          <option value="">— Sin líder —</option>
          {members.map(m => <option key={m._id} value={m._id}>{m.nombre} {m.apellido}{m.cargo ? ' · ' + m.cargo : ''}</option>)}
        </select>
        {!members.length && <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Agrega miembros al equipo primero.</p>}
      </Field>
      <Field label="DESCRIPCIÓN">
        <textarea className={inp} style={inpStyle} value={desc} onChange={e => setDesc(e.target.value)} rows={2} />
      </Field>
      <div className="flex gap-2 mt-2">
        <button onClick={save} disabled={saving} className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white disabled:opacity-60"
          style={{ background: 'var(--accent)' }}>{saving ? 'Guardando…' : 'Guardar'}</button>
        <button onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm"
          style={{ background: 'var(--surface2)', color: 'var(--text-muted)' }}>Cancelar</button>
      </div>
    </>
  );
}

export default function Equipos() {
  const { db, setDb, toast, user } = useApp();
  const navigate = useNavigate();
  const isLeader = user?.type === 'leader';
  const [pill, setPill]       = useState('all');
  const [filter, setFilter]   = useState('');
  const [teamModal, setTeamModal] = useState(null); // null | 'new' | teamId

  const teamsToShow = pill === 'all' ? db.teams : db.teams.filter(t => t._id === pill);
  const today = new Date(); today.setHours(0, 0, 0, 0);

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-xl font-black" style={{ color: 'var(--text-bright)' }}>👥 Equipos</div>
        {!isLeader && (
          <button onClick={() => setTeamModal('new')} className="text-sm px-4 py-2 rounded-xl font-semibold text-white"
            style={{ background: 'var(--accent)' }}>+ Equipo</button>
        )}
      </div>

      {/* Search */}
      <input type="text" value={filter} onChange={e => setFilter(e.target.value.toLowerCase())}
        placeholder="Buscar por nombre, cargo…"
        className="w-full rounded-xl px-4 py-2.5 text-sm mb-4 outline-none"
        style={{ background: 'var(--surface)', border: '1px solid var(--border2)', color: 'var(--text-bright)' }} />

      {/* Pills */}
      <div className="flex gap-2 flex-wrap mb-5">
        {[{ _id: 'all', name: 'Todos', color: 'var(--accent)' }, ...db.teams].map(t => (
          <button key={t._id} onClick={() => setPill(t._id)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
            style={pill === t._id
              ? { background: t.color || 'var(--accent)', color: '#fff', border: `1px solid ${t.color || 'var(--accent)'}` }
              : { background: 'var(--surface)', border: '1px solid var(--border2)', color: 'var(--text-muted)' }}>
            {t.name}
          </button>
        ))}
      </div>

      {/* Team panels */}
      {teamsToShow.map(t => {
        const allMembers = db.employees.filter(e => e.teamId === t._id);
        const members = allMembers.filter(e =>
          !filter || (e.nombre + ' ' + e.apellido + ' ' + (e.cargo || '')).toLowerCase().includes(filter));
        const leader = t.leadId ? db.employees.find(e => e._id === t.leadId) : null;
        const canEdit = !isLeader || user.teamId === t._id;

        return (
          <div key={t._id} className="rounded-2xl mb-4 overflow-hidden" style={{ border: `1px solid var(--border2)` }}>
            {/* Panel header */}
            <div className="flex items-center justify-between px-4 py-3" style={{ borderLeft: `4px solid ${t.color}`, background: 'var(--surface)' }}>
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-bold text-sm" style={{ color: 'var(--text-bright)' }}>{t.name}</span>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--surface2)', color: 'var(--text-muted)' }}>
                  {allMembers.length} persona{allMembers.length !== 1 ? 's' : ''}
                </span>
                {leader && <span className="text-xs" style={{ color: t.color }}>👑 {leader.nombre} {leader.apellido}</span>}
              </div>
              {canEdit && (
                <div className="flex gap-2 ml-2">
                  <button onClick={() => setTeamModal(t._id)} className="text-xs px-3 py-1.5 rounded-lg"
                    style={{ background: 'var(--surface2)', color: 'var(--text-muted)', border: '1px solid var(--border2)' }}>Editar</button>
                </div>
              )}
            </div>

            {/* Employee cards */}
            <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2" style={{ background: 'var(--surface2)' }}>
              {members.length === 0
                ? <p className="text-xs py-4 text-center col-span-2" style={{ color: 'var(--text-muted)' }}>
                    {filter ? 'Sin resultados' : 'Sin personas en este equipo'}
                  </p>
                : members.map(e => {
                  const initials = ((e.nombre||'?')[0] + (e.apellido||'')[0]).toUpperCase();
                  const isLead   = t.leadId === e._id;
                  const pendObj  = (e.objetivos || []).filter(o => o.estado === 'Pendiente').length;
                  const pendCap  = (e.capacitaciones || []).filter(c => c.estado === 'Pendiente').length;
                  const convs    = (e.conversaciones || []).filter(c => c.fecha).sort((a,b) => b.fecha.localeCompare(a.fecha));
                  const daysSince = convs[0] ? Math.round((today - new Date(convs[0].fecha + 'T00:00:00')) / 86400000) : null;
                  return (
                    <div key={e._id} onClick={() => navigate(`/employee/${e._id}`)}
                      className="rounded-xl p-3 cursor-pointer transition-all hover:scale-[1.01] flex flex-col gap-2"
                      style={{ background: 'var(--surface)', border: `1px solid var(--border2)`, borderLeft: `3px solid ${t.color}` }}>
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                          style={{ background: isLead ? 'linear-gradient(135deg,#b45309,#fbbf24)' : 'var(--surface2)', color: 'var(--text-bright)' }}>
                          {isLead ? '👑' : initials}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold truncate" style={{ color: 'var(--text-bright)' }}>{e.nombre} {e.apellido}</div>
                          <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{e.cargo || 'Sin cargo'}</div>
                        </div>
                      </div>
                      <div className="flex gap-1.5 flex-wrap">
                        {isLead && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(245,158,11,.15)', color: 'var(--warning)' }}>👑 Líder</span>}
                        {pendObj > 0 && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(245,158,11,.15)', color: 'var(--warning)' }}>⚠ {pendObj} obj</span>}
                        {pendCap > 0 && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(245,158,11,.15)', color: 'var(--warning)' }}>📚 {pendCap} cap</span>}
                        {daysSince !== null && (daysSince >= 30
                          ? <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(239,68,68,.15)', color: 'var(--danger)' }}>💬 {daysSince}d sin 1:1</span>
                          : <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(34,197,94,.15)', color: 'var(--success)' }}>💬 {convs.length} 1:1</span>
                        )}
                      </div>
                    </div>
                  );
                })
              }
              {canEdit && (
                <button onClick={() => { /* add person to team */ }}
                  className="rounded-xl p-3 text-sm font-semibold text-center transition-all"
                  style={{ border: `1px dashed var(--border2)`, color: 'var(--text-muted)', background: 'transparent' }}>
                  + Persona
                </button>
              )}
            </div>
          </div>
        );
      })}

      {/* Team modal */}
      {teamModal !== null && (
        <Modal
          title={teamModal === 'new' ? 'Nuevo Equipo' : 'Editar Equipo'}
          onClose={() => setTeamModal(null)}
        >
          <TeamForm
            teamId={teamModal === 'new' ? null : teamModal}
            onClose={() => setTeamModal(null)}
            onSaved={() => setTeamModal(null)}
          />
        </Modal>
      )}
    </div>
  );
}
