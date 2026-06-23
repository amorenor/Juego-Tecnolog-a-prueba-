import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { api } from '../api/index.js';
import Modal from '../components/Modal.jsx';
import { fmtDate, calcAge } from '../utils/index.js';

const TABS = [
  { id: 'personal',       label: 'Personal'      },
  { id: 'laboral',        label: 'Laboral'        },
  { id: 'objetivos',      label: 'Objetivos'      },
  { id: 'conversaciones', label: 'Conversaciones' },
  { id: 'capacitaciones', label: 'Capacitaciones' },
  { id: 'reconocimientos',label: 'Reconoc.'       },
];

const COMMIT_KEYS = {
  objetivo: 'objetivos', conversacion: 'conversaciones',
  capacitacion: 'capacitaciones', reconocimiento: 'reconocimientos',
};

function InfoItem({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <div className="py-2 border-b" style={{ borderColor: 'var(--border2)' }}>
      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</div>
      <div className="text-sm font-medium mt-0.5" style={{ color: 'var(--text-bright)' }}>{value}</div>
    </div>
  );
}

function CommitCard({ item, type, onEdit, onDelete }) {
  const statusColor = { Pendiente: 'var(--warning)', Completado: 'var(--success)', Cancelado: 'var(--text-muted)', 'En curso': 'var(--accent)' };
  return (
    <div className="rounded-xl p-3 mb-2" style={{ background: 'var(--surface2)', border: '1px solid var(--border2)' }}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {(item.titulo || item.nombre || item.tipo) && (
            <div className="font-semibold text-sm mb-1" style={{ color: 'var(--text-bright)' }}>
              {item.titulo || item.nombre || item.tipo}
            </div>
          )}
          {item.descripcion && <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{item.descripcion}</div>}
          <div className="flex flex-wrap gap-2 mt-1">
            {item.estado && <span className="text-xs font-semibold" style={{ color: statusColor[item.estado] || 'var(--text-muted)' }}>● {item.estado}</span>}
            {item.fecha && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>📅 {fmtDate(item.fecha)}</span>}
            {item.fechaLimite && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>⏰ {fmtDate(item.fechaLimite)}</span>}
            {item.fechaInicio && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{fmtDate(item.fechaInicio)}{item.fechaFin ? ` → ${fmtDate(item.fechaFin)}` : ''}</span>}
            {item.proveedor && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>🏫 {item.proveedor}</span>}
            {item.otorgadoPor && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>👤 {item.otorgadoPor}</span>}
            {item.proximaFecha && <span className="text-xs" style={{ color: 'var(--accent)' }}>📌 Próxima: {fmtDate(item.proximaFecha)}</span>}
          </div>
          {item.notas && <div className="text-xs mt-1 italic" style={{ color: 'var(--text-muted)' }}>{item.notas}</div>}
        </div>
        <div className="flex gap-1.5 flex-shrink-0">
          <button onClick={() => onEdit(item)} className="text-xs px-2 py-1 rounded-lg"
            style={{ background: 'var(--surface)', border: '1px solid var(--border2)', color: 'var(--text-muted)' }}>✏</button>
          <button onClick={() => onDelete(item._id)} className="text-xs px-2 py-1 rounded-lg"
            style={{ background: 'rgba(239,68,68,.1)', color: 'var(--danger)' }}>🗑</button>
        </div>
      </div>
    </div>
  );
}

function CommitForm({ type, existing, empId, onClose, onSaved }) {
  const { setDb, toast } = useApp();
  const init = existing || {};
  const [data, setData] = useState({
    titulo: init.titulo || '', descripcion: init.descripcion || '',
    fechaLimite: init.fechaLimite || '', estado: init.estado || 'Pendiente',
    prioridad: init.prioridad || 'Media', tipo: init.tipo || '1:1',
    fecha: init.fecha || '', proximaFecha: init.proximaFecha || '', notas: init.notas || '',
    nombre: init.nombre || '', proveedor: init.proveedor || '',
    fechaInicio: init.fechaInicio || '', fechaFin: init.fechaFin || '',
    otorgadoPor: init.otorgadoPor || '',
  });
  const [saving, setSaving] = useState(false);

  function set(key, val) { setData(prev => ({ ...prev, [key]: val })); }

  async function save() {
    setSaving(true);
    try {
      let updated;
      if (existing) {
        updated = await api.updateCommitment(empId, type, existing._id, data);
      } else {
        updated = await api.addCommitment(empId, type, data);
      }
      setDb(prev => ({ ...prev, employees: prev.employees.map(e => e._id === empId ? updated : e) }));
      toast('Guardado'); onSaved();
    } catch (err) { toast(err.message); }
    finally { setSaving(false); }
  }

  const inp = "w-full rounded-xl px-4 py-2.5 text-sm outline-none";
  const is = { background: 'var(--surface2)', border: '1px solid var(--border2)', color: 'var(--text-bright)' };
  const F = ({ label, children }) => (
    <div className="mb-3">
      <label className="block text-xs font-semibold tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>{label}</label>
      {children}
    </div>
  );

  return (
    <div>
      {type === 'objetivo' && <>
        <F label="TÍTULO"><input className={inp} style={is} value={data.titulo} onChange={e => set('titulo', e.target.value)} /></F>
        <F label="DESCRIPCIÓN"><textarea className={inp} style={is} rows={2} value={data.descripcion} onChange={e => set('descripcion', e.target.value)} /></F>
        <div className="grid grid-cols-2 gap-3">
          <F label="FECHA LÍMITE"><input type="date" className={inp} style={is} value={data.fechaLimite} onChange={e => set('fechaLimite', e.target.value)} /></F>
          <F label="ESTADO">
            <select className={inp} style={is} value={data.estado} onChange={e => set('estado', e.target.value)}>
              {['Pendiente','En curso','Completado','Cancelado'].map(s => <option key={s}>{s}</option>)}
            </select>
          </F>
          <F label="PRIORIDAD">
            <select className={inp} style={is} value={data.prioridad} onChange={e => set('prioridad', e.target.value)}>
              {['Alta','Media','Baja'].map(s => <option key={s}>{s}</option>)}
            </select>
          </F>
        </div>
      </>}
      {type === 'conversacion' && <>
        <div className="grid grid-cols-2 gap-3">
          <F label="TIPO">
            <select className={inp} style={is} value={data.tipo} onChange={e => set('tipo', e.target.value)}>
              {['1:1','Feedback','Desempeño','Desarrollo','Otro'].map(s => <option key={s}>{s}</option>)}
            </select>
          </F>
          <F label="FECHA"><input type="date" className={inp} style={is} value={data.fecha} onChange={e => set('fecha', e.target.value)} /></F>
          <F label="PRÓXIMA FECHA"><input type="date" className={inp} style={is} value={data.proximaFecha} onChange={e => set('proximaFecha', e.target.value)} /></F>
        </div>
        <F label="NOTAS"><textarea className={inp} style={is} rows={3} value={data.notas} onChange={e => set('notas', e.target.value)} /></F>
      </>}
      {type === 'capacitacion' && <>
        <F label="NOMBRE"><input className={inp} style={is} value={data.nombre} onChange={e => set('nombre', e.target.value)} /></F>
        <F label="PROVEEDOR"><input className={inp} style={is} value={data.proveedor} onChange={e => set('proveedor', e.target.value)} /></F>
        <div className="grid grid-cols-2 gap-3">
          <F label="INICIO"><input type="date" className={inp} style={is} value={data.fechaInicio} onChange={e => set('fechaInicio', e.target.value)} /></F>
          <F label="FIN"><input type="date" className={inp} style={is} value={data.fechaFin} onChange={e => set('fechaFin', e.target.value)} /></F>
          <F label="ESTADO">
            <select className={inp} style={is} value={data.estado} onChange={e => set('estado', e.target.value)}>
              {['Pendiente','En curso','Completado','Cancelado'].map(s => <option key={s}>{s}</option>)}
            </select>
          </F>
        </div>
        <F label="DESCRIPCIÓN"><textarea className={inp} style={is} rows={2} value={data.descripcion} onChange={e => set('descripcion', e.target.value)} /></F>
      </>}
      {type === 'reconocimiento' && <>
        <F label="TIPO"><input className={inp} style={is} value={data.tipo} onChange={e => set('tipo', e.target.value)} placeholder="Ej: Premio, Mención…" /></F>
        <div className="grid grid-cols-2 gap-3">
          <F label="FECHA"><input type="date" className={inp} style={is} value={data.fecha} onChange={e => set('fecha', e.target.value)} /></F>
          <F label="OTORGADO POR"><input className={inp} style={is} value={data.otorgadoPor} onChange={e => set('otorgadoPor', e.target.value)} /></F>
        </div>
        <F label="DESCRIPCIÓN"><textarea className={inp} style={is} rows={2} value={data.descripcion} onChange={e => set('descripcion', e.target.value)} /></F>
      </>}
      <div className="flex gap-2 mt-4">
        <button onClick={save} disabled={saving} className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white disabled:opacity-60"
          style={{ background: 'var(--accent)' }}>{saving ? 'Guardando…' : 'Guardar'}</button>
        <button onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm"
          style={{ background: 'var(--surface2)', color: 'var(--text-muted)' }}>Cancelar</button>
      </div>
    </div>
  );
}

export default function Employee() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { db, setDb, toast } = useApp();
  const [activeTab, setActiveTab] = useState('personal');
  const [empModal, setEmpModal]   = useState(false);
  const [commitModal, setCommitModal] = useState(null); // { type, existing }

  const emp  = db.employees.find(e => e._id === id);
  const team = emp ? db.teams.find(t => t._id === emp.teamId) : null;

  if (!emp) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <p style={{ color: 'var(--text-muted)' }}>Persona no encontrada</p>
      <button onClick={() => navigate('/equipos')} className="text-sm px-4 py-2 rounded-xl"
        style={{ background: 'var(--accent)', color: '#fff' }}>← Volver</button>
    </div>
  );

  const initials = ((emp.nombre||'?')[0] + (emp.apellido||'')[0]).toUpperCase();

  async function deleteEmployee() {
    if (!confirm(`¿Eliminar a ${emp.nombre} ${emp.apellido}?`)) return;
    try {
      await api.deleteEmployee(emp._id);
      setDb(prev => ({ ...prev, employees: prev.employees.filter(e => e._id !== emp._id) }));
      toast('Persona eliminada');
      navigate('/equipos');
    } catch (err) { toast(err.message); }
  }

  async function deleteCommit(type, cid) {
    if (!confirm('¿Eliminar este registro?')) return;
    try {
      const updated = await api.deleteCommitment(emp._id, type, cid);
      setDb(prev => ({ ...prev, employees: prev.employees.map(e => e._id === emp._id ? updated : e) }));
      toast('Eliminado');
    } catch (err) { toast(err.message); }
  }

  const items = (type) => emp[COMMIT_KEYS[type]] || [];

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-24">
      {/* Back */}
      <button onClick={() => navigate('/equipos')} className="text-sm mb-4 flex items-center gap-1"
        style={{ color: 'var(--text-muted)' }}>← Volver al equipo</button>

      {/* Profile hero */}
      <div className="rounded-2xl p-4 mb-4 flex items-center gap-4"
        style={{ background: 'var(--surface)', border: `2px solid ${team?.color || 'var(--border2)'}33` }}>
        <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0"
          style={{ background: team?.color ? `${team.color}33` : 'var(--surface2)', color: team?.color || 'var(--text-bright)', border: `2px solid ${team?.color || 'var(--border2)'}` }}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-black text-lg" style={{ color: 'var(--text-bright)' }}>{emp.nombre} {emp.apellido}</div>
          <div className="text-sm" style={{ color: team?.color || 'var(--text-muted)' }}>{emp.cargo || 'Sin cargo'}{team ? ` · ${team.name}` : ''}</div>
          {emp.nacimiento && <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{calcAge(emp.nacimiento)} años</div>}
        </div>
        <div className="flex flex-col gap-1.5">
          <button onClick={() => setEmpModal(true)} className="text-xs px-3 py-1.5 rounded-lg"
            style={{ background: 'var(--surface2)', border: '1px solid var(--border2)', color: 'var(--text-muted)' }}>✏ Editar</button>
          <button onClick={deleteEmployee} className="text-xs px-3 py-1.5 rounded-lg"
            style={{ background: 'rgba(239,68,68,.1)', color: 'var(--danger)' }}>🗑</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto mb-4 pb-1">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className="px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0"
            style={activeTab === t.id
              ? { background: 'var(--accent)', color: '#fff' }
              : { background: 'var(--surface)', border: '1px solid var(--border2)', color: 'var(--text-muted)' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Personal */}
      {activeTab === 'personal' && (
        <div className="rounded-2xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border2)' }}>
          <div className="text-xs font-bold tracking-wider mb-3" style={{ color: 'var(--accent)' }}>DATOS PERSONALES</div>
          <InfoItem label="RUT" value={emp.rut} />
          <InfoItem label="Fecha de nacimiento" value={emp.nacimiento ? `${fmtDate(emp.nacimiento)} (${calcAge(emp.nacimiento)} años)` : null} />
          <InfoItem label="Email" value={emp.email} />
          <InfoItem label="Teléfono" value={emp.tel} />
          <div className="text-xs font-bold tracking-wider mt-4 mb-3" style={{ color: 'var(--accent)' }}>FAMILIA</div>
          <InfoItem label="Estado civil" value={emp.estadoCivil} />
          <InfoItem label="Hijos" value={emp.hijos !== undefined && emp.hijos !== '' ? emp.hijos : null} />
          <InfoItem label="Contacto emergencia" value={emp.emergNombre} />
          <InfoItem label="Tel. emergencia" value={emp.emergTel} />
          <div className="text-xs font-bold tracking-wider mt-4 mb-3" style={{ color: 'var(--accent)' }}>FORMACIÓN</div>
          <InfoItem label="Nivel educacional" value={emp.educacion} />
          <InfoItem label="Título / Profesión" value={emp.titulo} />
          <InfoItem label="Certificaciones" value={emp.cert} />
          <InfoItem label="Idiomas" value={emp.idiomas} />
        </div>
      )}

      {/* Tab: Laboral */}
      {activeTab === 'laboral' && (
        <div className="rounded-2xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border2)' }}>
          <div className="text-xs font-bold tracking-wider mb-3" style={{ color: 'var(--accent)' }}>DATOS LABORALES</div>
          <InfoItem label="Cargo" value={emp.cargo} />
          <InfoItem label="Equipo" value={team?.name} />
          <InfoItem label="Fecha de ingreso" value={fmtDate(emp.ingreso)} />
          <InfoItem label="Tipo de contrato" value={emp.contrato} />
          <InfoItem label="Centro de costo" value={emp.ceco} />
          <InfoItem label="Jornada" value={emp.jornada} />
        </div>
      )}

      {/* Commitment tabs */}
      {['objetivos','conversaciones','capacitaciones','reconocimientos'].includes(activeTab) && (() => {
        const typeMap = { objetivos: 'objetivo', conversaciones: 'conversacion', capacitaciones: 'capacitacion', reconocimientos: 'reconocimiento' };
        const type = typeMap[activeTab];
        const labelMap = { objetivo: 'Objetivo', conversacion: 'Conversación', capacitacion: 'Capacitación', reconocimiento: 'Reconocimiento' };
        const list = items(type);
        return (
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="font-bold text-sm" style={{ color: 'var(--text-bright)' }}>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</span>
              <button onClick={() => setCommitModal({ type, existing: null })}
                className="text-sm px-3 py-1.5 rounded-xl font-semibold text-white" style={{ background: 'var(--accent)' }}>
                + {labelMap[type]}
              </button>
            </div>
            {list.length === 0
              ? <div className="text-center py-10 text-sm" style={{ color: 'var(--text-muted)' }}>Sin registros</div>
              : list.map(item => (
                <CommitCard key={item._id} item={item} type={type}
                  onEdit={it => setCommitModal({ type, existing: it })}
                  onDelete={cid => deleteCommit(type, cid)} />
              ))
            }
          </div>
        );
      })()}

      {/* Employee edit modal */}
      {empModal && (
        <Modal title="Editar Persona" onClose={() => setEmpModal(false)} maxWidth="600px">
          <EmpForm emp={emp} onClose={() => setEmpModal(false)} onSaved={() => setEmpModal(false)} />
        </Modal>
      )}

      {/* Commitment modal */}
      {commitModal && (
        <Modal title={commitModal.existing ? 'Editar registro' : 'Nuevo registro'} onClose={() => setCommitModal(null)}>
          <CommitForm type={commitModal.type} existing={commitModal.existing} empId={emp._id}
            onClose={() => setCommitModal(null)} onSaved={() => setCommitModal(null)} />
        </Modal>
      )}
    </div>
  );
}

function EmpForm({ emp, onClose, onSaved }) {
  const { db, setDb, toast } = useApp();
  const [d, setD] = useState({
    nombre: emp?.nombre || '', apellido: emp?.apellido || '', rut: emp?.rut || '',
    nacimiento: emp?.nacimiento || '', email: emp?.email || '', tel: emp?.tel || '',
    estadoCivil: emp?.estadoCivil || '', hijos: emp?.hijos ?? '',
    emergNombre: emp?.emergNombre || '', emergTel: emp?.emergTel || '',
    educacion: emp?.educacion || '', titulo: emp?.titulo || '',
    cert: emp?.cert || '', idiomas: emp?.idiomas || '',
    cargo: emp?.cargo || '', ingreso: emp?.ingreso || '',
    contrato: emp?.contrato || '', ceco: emp?.ceco || '', jornada: emp?.jornada || '',
    teamId: emp?.teamId || '',
  });
  const [saving, setSaving] = useState(false);

  function set(k, v) { setD(prev => ({ ...prev, [k]: v })); }

  async function save() {
    if (!d.nombre.trim() || !d.apellido.trim()) { toast('Nombre y apellido son obligatorios'); return; }
    setSaving(true);
    try {
      let updated;
      if (emp) {
        updated = await api.updateEmployee(emp._id, d);
        setDb(prev => ({ ...prev, employees: prev.employees.map(e => e._id === emp._id ? updated : e) }));
      } else {
        updated = await api.createEmployee(d);
        setDb(prev => ({ ...prev, employees: [...prev.employees, updated] }));
      }
      toast('Guardado'); onSaved();
    } catch (err) { toast(err.message); }
    finally { setSaving(false); }
  }

  const inp = "w-full rounded-xl px-3 py-2 text-sm outline-none";
  const is = { background: 'var(--surface2)', border: '1px solid var(--border2)', color: 'var(--text-bright)' };
  const F = ({ label, children }) => (
    <div className="mb-3">
      <label className="block text-xs font-semibold tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>{label}</label>
      {children}
    </div>
  );

  return (
    <>
      <div className="text-xs font-bold tracking-wider mb-3" style={{ color: 'var(--accent)' }}>DATOS PERSONALES</div>
      <div className="grid grid-cols-2 gap-2">
        <F label="NOMBRE"><input className={inp} style={is} value={d.nombre} onChange={e => set('nombre', e.target.value)} /></F>
        <F label="APELLIDO"><input className={inp} style={is} value={d.apellido} onChange={e => set('apellido', e.target.value)} /></F>
        <F label="RUT"><input className={inp} style={is} value={d.rut} onChange={e => set('rut', e.target.value)} placeholder="12.345.678-9" /></F>
        <F label="NACIMIENTO"><input type="date" className={inp} style={is} value={d.nacimiento} onChange={e => set('nacimiento', e.target.value)} /></F>
        <F label="EMAIL"><input type="email" className={inp} style={is} value={d.email} onChange={e => set('email', e.target.value)} /></F>
        <F label="TELÉFONO"><input type="tel" className={inp} style={is} value={d.tel} onChange={e => set('tel', e.target.value)} /></F>
      </div>
      <div className="text-xs font-bold tracking-wider mt-4 mb-3" style={{ color: 'var(--accent)' }}>FAMILIA</div>
      <div className="grid grid-cols-2 gap-2">
        <F label="ESTADO CIVIL">
          <select className={inp} style={is} value={d.estadoCivil} onChange={e => set('estadoCivil', e.target.value)}>
            <option value="">— Seleccionar —</option>
            {['Soltero/a','Casado/a','Conviviente','Divorciado/a','Viudo/a'].map(s => <option key={s}>{s}</option>)}
          </select>
        </F>
        <F label="N° HIJOS"><input type="number" className={inp} style={is} min="0" value={d.hijos} onChange={e => set('hijos', e.target.value)} /></F>
        <F label="CONTACTO EMERGENCIA"><input className={inp} style={is} value={d.emergNombre} onChange={e => set('emergNombre', e.target.value)} /></F>
        <F label="TEL. EMERGENCIA"><input className={inp} style={is} value={d.emergTel} onChange={e => set('emergTel', e.target.value)} /></F>
      </div>
      <div className="text-xs font-bold tracking-wider mt-4 mb-3" style={{ color: 'var(--accent)' }}>FORMACIÓN</div>
      <div className="grid grid-cols-2 gap-2">
        <F label="NIVEL EDUCACIONAL">
          <select className={inp} style={is} value={d.educacion} onChange={e => set('educacion', e.target.value)}>
            <option value="">— Seleccionar —</option>
            {['Básica','Media','Técnico Superior','Universitaria','Postgrado / Magíster','Doctorado'].map(s => <option key={s}>{s}</option>)}
          </select>
        </F>
        <F label="TÍTULO"><input className={inp} style={is} value={d.titulo} onChange={e => set('titulo', e.target.value)} /></F>
        <F label="CERTIFICACIONES"><input className={inp} style={is} value={d.cert} onChange={e => set('cert', e.target.value)} placeholder="AWS, PMP…" /></F>
        <F label="IDIOMAS"><input className={inp} style={is} value={d.idiomas} onChange={e => set('idiomas', e.target.value)} /></F>
      </div>
      <div className="text-xs font-bold tracking-wider mt-4 mb-3" style={{ color: 'var(--accent)' }}>DATOS LABORALES</div>
      <div className="grid grid-cols-2 gap-2">
        <F label="CARGO"><input className={inp} style={is} value={d.cargo} onChange={e => set('cargo', e.target.value)} /></F>
        <F label="EQUIPO">
          <select className={inp} style={is} value={d.teamId} onChange={e => set('teamId', e.target.value)}>
            <option value="">— Sin equipo —</option>
            {db.teams.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
          </select>
        </F>
        <F label="INGRESO"><input type="date" className={inp} style={is} value={d.ingreso} onChange={e => set('ingreso', e.target.value)} /></F>
        <F label="CONTRATO">
          <select className={inp} style={is} value={d.contrato} onChange={e => set('contrato', e.target.value)}>
            <option value="">— Seleccionar —</option>
            {['Indefinido','Plazo Fijo','Por Obra','Honorarios','Práctica'].map(s => <option key={s}>{s}</option>)}
          </select>
        </F>
        <F label="CENTRO COSTO"><input className={inp} style={is} value={d.ceco} onChange={e => set('ceco', e.target.value)} /></F>
        <F label="JORNADA">
          <select className={inp} style={is} value={d.jornada} onChange={e => set('jornada', e.target.value)}>
            <option value="">— Seleccionar —</option>
            {['Completa','Parcial','Turno'].map(s => <option key={s}>{s}</option>)}
          </select>
        </F>
      </div>
      <div className="flex gap-2 mt-4">
        <button onClick={save} disabled={saving} className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white disabled:opacity-60"
          style={{ background: 'var(--accent)' }}>{saving ? 'Guardando…' : 'Guardar'}</button>
        <button onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm"
          style={{ background: 'var(--surface2)', color: 'var(--text-muted)' }}>Cancelar</button>
      </div>
    </>
  );
}
