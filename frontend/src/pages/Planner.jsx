import { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { api } from '../api/index.js';
import Modal from '../components/Modal.jsx';
import { HOLIDAYS, isWeekend, isWorkday, isHoliday, getMondayOf, weekDates, fmtDate, toDs } from '../utils/index.js';

const DNAMES = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

export default function Planner() {
  const { db, setDb, toast, user } = useApp();
  const isLeader  = user?.type === 'leader';
  const readonly  = user?.type === 'manager';
  const [week, setWeek] = useState(() => getMondayOf(new Date()));
  const [plannerTeam, setPlannerTeam] = useState(isLeader ? user.teamId : 'all');
  const [compModal, setCompModal] = useState(null); // { empId, date }
  const [compMotivo, setCompMotivo] = useState('');

  const dates = weekDates(week);
  const d0 = new Date(dates[0] + 'T12:00:00');
  const d6 = new Date(dates[6] + 'T12:00:00');
  const weekLabel = `${d0.getDate()} ${MONTHS[d0.getMonth()]} – ${d6.getDate()} ${MONTHS[d6.getMonth()]} ${d6.getFullYear()}`;
  const hdaysThisWeek = dates.filter(d => HOLIDAYS[d]);

  const emps = (plannerTeam === 'all' ? [...db.employees] : db.employees.filter(e => e.teamId === plannerTeam))
    .sort((a, b) => (a.teamId + a.apellido).localeCompare(b.teamId + b.apellido));

  function getAtt(empId, date, type) {
    return db.attendance.find(a => a.empId === empId && a.date === date && a.type === type) || null;
  }

  function changeWeek(dir) {
    setWeek(prev => { const d = new Date(prev); d.setDate(d.getDate() + dir * 7); return getMondayOf(d); });
  }

  async function toggleAtt(empId, date, type) {
    const existing = getAtt(empId, date, type);
    if (type === 'compensado' && !existing) {
      const emp = db.employees.find(e => e._id === empId);
      setCompModal({ empId, date, empName: `${emp?.nombre} ${emp?.apellido}` });
      setCompMotivo('');
      return;
    }
    if (existing) {
      try {
        await api.deleteAttendance(existing._id);
        setDb(prev => ({ ...prev, attendance: prev.attendance.filter(a => a._id !== existing._id) }));
      } catch (err) { toast(err.message); }
    } else {
      const emp = db.employees.find(e => e._id === empId);
      try {
        const record = await api.createAttendance({ empId, teamId: emp?.teamId, date, type, motivo: '' });
        setDb(prev => ({ ...prev, attendance: [...prev.attendance.filter(a => !(a.empId === empId && a.date === date)), record] }));
      } catch (err) { toast(err.message); }
    }
  }

  async function saveCompensado() {
    if (!compMotivo.trim()) { toast('Escribe el motivo del día compensado'); return; }
    const { empId, date } = compModal;
    const emp = db.employees.find(e => e._id === empId);
    try {
      const record = await api.createAttendance({ empId, teamId: emp?.teamId, date, type: 'compensado', motivo: compMotivo.trim() });
      setDb(prev => ({ ...prev, attendance: [...prev.attendance.filter(a => !(a.empId === empId && a.date === date)), record] }));
      setCompModal(null);
      toast('Día compensado guardado');
    } catch (err) { toast(err.message); }
  }

  const inp = "w-full rounded-xl px-4 py-2.5 text-sm outline-none";
  const inpStyle = { background: 'var(--surface2)', border: '1px solid var(--border2)', color: 'var(--text-bright)' };

  return (
    <div className="max-w-full px-4 pt-6 pb-24">
      <div className="max-w-2xl mx-auto">
        <div className="text-xl font-black mb-4" style={{ color: 'var(--text-bright)' }}>📋 Planificación Semanal</div>

        {/* User badge */}
        {user && (
          <div className="mb-4 px-4 py-2.5 rounded-xl text-sm flex items-center gap-2"
            style={{ background: 'var(--surface)', border: '1px solid var(--border2)' }}>
            <span>{isLeader ? '👥' : '⭐'}</span>
            <span>Ingresando como <strong style={{ color: 'var(--text-bright)' }}>{user.name}</strong></span>
          </div>
        )}

        {/* Week nav */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <button onClick={() => changeWeek(-1)} className="w-9 h-9 rounded-full flex items-center justify-center text-lg transition-colors"
            style={{ background: 'var(--surface)', border: '1px solid var(--border2)', color: 'var(--text-bright)' }}>←</button>
          <span className="font-semibold text-sm" style={{ color: 'var(--text-bright)' }}>{weekLabel}</span>
          <button onClick={() => changeWeek(1)} className="w-9 h-9 rounded-full flex items-center justify-center text-lg transition-colors"
            style={{ background: 'var(--surface)', border: '1px solid var(--border2)', color: 'var(--text-bright)' }}>→</button>
        </div>

        {/* Holidays */}
        {hdaysThisWeek.map(d => (
          <div key={d} className="mb-2 px-3 py-2 rounded-xl text-xs"
            style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', color: 'var(--danger)' }}>
            🎌 <b>{HOLIDAYS[d]}</b> — {fmtDate(d)}
          </div>
        ))}

        {/* Restriction notice */}
        <div className="mb-4 px-3 py-2 rounded-xl text-xs" style={{ background: 'var(--surface)', border: '1px solid var(--border2)', color: 'var(--text-muted)' }}>
          ⚠️ Restricciones teletrabajo: <b>Lun–Jue</b> máx. 2 personas/equipo · <b>Viernes</b> máx. 1 persona/equipo
        </div>

        {/* Team tabs */}
        {!isLeader && (
          <div className="flex gap-2 flex-wrap mb-4">
            {[{ _id: 'all', name: 'Todos' }, ...db.teams].map(t => (
              <button key={t._id} onClick={() => setPlannerTeam(t._id)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold"
                style={plannerTeam === t._id
                  ? { background: t.color || 'var(--accent)', color: '#fff', border: `1px solid ${t.color || 'var(--accent)'}` }
                  : { background: 'var(--surface)', border: '1px solid var(--border2)', color: 'var(--text-muted)' }}>
                {t.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Planner table */}
      {emps.length === 0
        ? <div className="text-center py-10 text-sm" style={{ color: 'var(--text-muted)' }}>Sin personas para mostrar</div>
        : (
          <div className="planner-wrap">
            <table className="planner-table">
              <thead>
                <tr>
                  <th className="col-name">Persona</th>
                  {dates.map((d, i) => {
                    const hw = HOLIDAYS[d], we = isWeekend(d);
                    return (
                      <th key={d} className={hw ? 'col-holiday' : we ? 'col-weekend' : ''}>
                        {DNAMES[i]}<br/>
                        <span style={{ fontWeight: 400, fontSize: '.78em' }}>{d.split('-')[2]}</span>
                        {hw && <><br/><span style={{ fontSize: '.6em', fontWeight: 400 }}>{hw.split(' ').slice(0,2).join(' ')}</span></>}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {emps.map(e => {
                  const team = db.teams.find(t => t._id === e.teamId);
                  return (
                    <tr key={e._id}>
                      <td className="col-name">
                        <div className="p-name">{e.nombre} {e.apellido}</div>
                        <div className="p-role">{e.cargo || ''}{team ? ` · ${team.name}` : ''}</div>
                      </td>
                      {dates.map(d => {
                        const wd = isWorkday(d), we = isWeekend(d), hd = !!HOLIDAYS[d];
                        const sT = getAtt(e._id, d, 'teletrabajo');
                        const sV = getAtt(e._id, d, 'vacaciones');
                        const sC = getAtt(e._id, d, 'compensado');
                        const dow   = new Date(d + 'T12:00:00').getDay();
                        const limit = dow === 5 ? 1 : 2;
                        const teamTele = db.attendance.filter(a => a.type === 'teletrabajo' && a.date === d && a.teamId === e.teamId && a.empId !== e._id).length;
                        const tBlocked = !wd || !!sV || !!sC || (!sT && teamTele >= limit);
                        const cBlocked = !wd || !!sV;
                        const bg = (we || hd) ? 'background:var(--surface3)' : '';
                        return (
                          <td key={d} style={{ background: (we || hd) ? 'var(--surface3)' : '', opacity: readonly ? 0.85 : 1 }}>
                            <div className="day-btns">
                              <button className={`day-btn${sT ? ' on-T' : ''}`}
                                disabled={(!wd || !!sV || !!sC || (!sT && teamTele >= limit)) && !sT || readonly}
                                onClick={() => !readonly && toggleAtt(e._id, d, 'teletrabajo')} title="Teletrabajo">T</button>
                              <button className={`day-btn${sV ? ' on-V' : ''}`}
                                disabled={(!we && !isHoliday(d)) && !sV || readonly}
                                onClick={() => !readonly && toggleAtt(e._id, d, 'vacaciones')} title="Vacaciones">V</button>
                              <button className={`day-btn${sC ? ' on-C' : ''}`}
                                disabled={(cBlocked && !sC) || readonly}
                                onClick={() => !readonly && toggleAtt(e._id, d, 'compensado')} title="Compensado">C</button>
                            </div>
                            {sC?.motivo && (
                              <div style={{ fontSize: '.58rem', color: 'var(--warning)', textAlign: 'center', marginTop: '2px' }}>
                                {sC.motivo.slice(0, 18)}{sC.motivo.length > 18 ? '…' : ''}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      }

      {/* Legend */}
      <div className="flex gap-4 mt-3 text-xs px-4 flex-wrap" style={{ color: 'var(--text-muted)' }}>
        <span><span className="day-btn on-T" style={{ display:'inline-flex',alignItems:'center',justifyContent:'center',pointerEvents:'none',width:'20px',height:'20px',borderRadius:'4px',border:'1px solid',borderColor:'var(--accent)',background:'rgba(59,158,255,.2)',color:'var(--accent)',fontWeight:700,fontSize:'.65rem' }}>T</span> Teletrabajo</span>
        <span><span className="day-btn on-V" style={{ display:'inline-flex',alignItems:'center',justifyContent:'center',pointerEvents:'none',width:'20px',height:'20px',borderRadius:'4px',border:'1px solid',borderColor:'var(--success)',background:'rgba(34,197,94,.2)',color:'var(--success)',fontWeight:700,fontSize:'.65rem' }}>V</span> Vacaciones</span>
        <span><span className="day-btn on-C" style={{ display:'inline-flex',alignItems:'center',justifyContent:'center',pointerEvents:'none',width:'20px',height:'20px',borderRadius:'4px',border:'1px solid',borderColor:'var(--warning)',background:'rgba(245,158,11,.2)',color:'var(--warning)',fontWeight:700,fontSize:'.65rem' }}>C</span> Compensado</span>
      </div>

      {/* Compensado modal */}
      {compModal && (
        <Modal title={`Compensado · ${compModal.empName} · ${fmtDate(compModal.date)}`} onClose={() => setCompModal(null)} maxWidth="420px">
          <div className="mb-4">
            <label className="block text-xs font-semibold tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>MOTIVO</label>
            <textarea className="w-full rounded-xl px-4 py-2.5 text-sm outline-none" rows={3}
              style={{ background: 'var(--surface2)', border: '1px solid var(--border2)', color: 'var(--text-bright)' }}
              placeholder="Ej: Compensación por trabajo en feriado…"
              value={compMotivo} onChange={e => setCompMotivo(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <button onClick={saveCompensado} className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white"
              style={{ background: 'var(--accent)' }}>Guardar</button>
            <button onClick={() => setCompModal(null)} className="px-4 py-2.5 rounded-xl text-sm"
              style={{ background: 'var(--surface2)', color: 'var(--text-muted)' }}>Cancelar</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
