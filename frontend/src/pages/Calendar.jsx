import { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import Modal from '../components/Modal.jsx';
import { HOLIDAYS, toDs, fmtDate } from '../utils/index.js';

const MNAMES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DNAMES_FULL = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
const DNAMES_WORK = ['Lun','Mar','Mié','Jue','Vie'];

export default function Calendar() {
  const { db } = useApp();
  const [year,  setYear]  = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [view,  setView]  = useState('full');
  const [dayDetail, setDayDetail] = useState(null);

  const isWork = view === 'work';
  const cols   = isWork ? 5 : 7;
  const DNAMES = isWork ? DNAMES_WORK : DNAMES_FULL;

  const today   = new Date(); today.setHours(0, 0, 0, 0);
  const todayDs = toDs(today);

  function changeMonth(dir) {
    setMonth(prev => {
      let m = prev + dir, y = year;
      if (m > 11) { m = 0;  setYear(y + 1); }
      if (m < 0)  { m = 11; setYear(y - 1); }
      return m;
    });
  }

  // Build calendar cells
  const firstDow   = new Date(year, month, 1).getDay();
  const startOffset = firstDow === 0 ? 6 : firstDow - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevM = month === 0 ? 11 : month - 1;
  const prevY = month === 0 ? year - 1 : year;
  const dInPrev = new Date(prevY, prevM + 1, 0).getDate();
  const nextM = month === 11 ? 0 : month + 1;
  const nextY = month === 11 ? year + 1 : year;

  const full = [];
  for (let i = startOffset - 1; i >= 0; i--) full.push({ ds: toDs(new Date(prevY, prevM, dInPrev - i)), other: true });
  for (let d = 1; d <= daysInMonth; d++) full.push({ ds: toDs(new Date(year, month, d)), other: false });
  let nd = 1; while (full.length < 42) full.push({ ds: toDs(new Date(nextY, nextM, nd++)), other: true });
  const cells = isWork ? full.filter((_, i) => i % 7 < 5) : full;

  function DayCell({ ds, other }) {
    const d   = new Date(ds + 'T12:00:00');
    const we  = d.getDay() === 0 || d.getDay() === 6;
    const hw  = HOLIDAYS[ds];
    const isT = ds === todayDs;
    const att = db.attendance.filter(a => a.date === ds);
    const tele = att.filter(a => a.type === 'teletrabajo');
    const vac  = att.filter(a => a.type === 'vacaciones');
    const comp = att.filter(a => a.type === 'compensado');

    let extraCls = '';
    if (other) extraCls = 'other-month';
    else { if (we) extraCls = 'weekend'; if (hw) extraCls += ' holiday'; if (isT) extraCls += ' today'; }

    return (
      <div className={`cal-day ${extraCls}`} onClick={() => !other && setDayDetail(ds)}>
        <div className="cal-num">{d.getDate()}</div>
        {hw && <div className="cal-hday">{hw}</div>}
        <div className="cal-chips">
          {tele.length > 0 && <div className="cal-chip cal-chip-T">💻 {tele.length} teletrabajo</div>}
          {vac.length  > 0 && <div className="cal-chip cal-chip-V">🌴 {vac.length} vacaciones</div>}
          {comp.length > 0 && <div className="cal-chip cal-chip-C">📅 {comp.length} compensado</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-24">
      <div className="text-xl font-black mb-4" style={{ color: 'var(--text-bright)' }}>📅 Vista de Gerencia</div>

      {/* Month nav */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <button onClick={() => changeMonth(-1)} className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: 'var(--surface)', border: '1px solid var(--border2)', color: 'var(--text-bright)' }}>←</button>
        <span className="font-bold text-base" style={{ color: 'var(--text-bright)' }}>{MNAMES[month]} {year}</span>
        <button onClick={() => changeMonth(1)} className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: 'var(--surface)', border: '1px solid var(--border2)', color: 'var(--text-bright)' }}>→</button>
      </div>

      {/* View toggle */}
      <div className="flex gap-2 mb-4">
        {[['full','L–D'],['work','L–V']].map(([v, label]) => (
          <button key={v} onClick={() => setView(v)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
            style={view === v
              ? { background: 'var(--accent)', color: '#fff' }
              : { background: 'var(--surface)', border: '1px solid var(--border2)', color: 'var(--text-muted)' }}>
            Semana {label}
          </button>
        ))}
      </div>

      {/* Calendar */}
      <div id="cal-wrap">
        <div className="cal-header-row" style={{ gridTemplateColumns: `repeat(${cols},1fr)` }}>
          {DNAMES.map(d => <div key={d} className="cal-header-cell">{d}</div>)}
        </div>
        <div className="cal-grid" style={{ gridTemplateColumns: `repeat(${cols},1fr)` }}>
          {cells.map(({ ds, other }) => <DayCell key={ds} ds={ds} other={other} />)}
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-4 text-xs flex-wrap" style={{ color: 'var(--text-muted)' }}>
        <span>💻 Teletrabajo</span>
        <span>🌴 Vacaciones</span>
        <span>📅 Compensado</span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded inline-block" style={{ background: 'rgba(239,68,68,0.25)' }}></span>Festivo
        </span>
      </div>

      {/* Day detail modal */}
      {dayDetail && (
        <Modal title={`${fmtDate(dayDetail)}${HOLIDAYS[dayDetail] ? ' · ' + HOLIDAYS[dayDetail] : ''}`}
          onClose={() => setDayDetail(null)}>
          {(() => {
            const att = db.attendance.filter(a => a.date === dayDetail);
            const types = [
              { key: 'teletrabajo', label: 'Teletrabajo', icon: '💻' },
              { key: 'vacaciones',  label: 'Vacaciones',  icon: '🌴' },
              { key: 'compensado',  label: 'Compensados', icon: '📅' },
            ];
            const content = types.flatMap(({ key, label, icon }) => {
              const items = att.filter(a => a.type === key);
              if (!items.length) return [];
              return [
                <div key={`h-${key}`} className="text-xs font-bold tracking-wider mb-2 mt-3 first:mt-0" style={{ color: 'var(--text-muted)' }}>
                  {icon} {label} ({items.length})
                </div>,
                ...items.map(a => {
                  const emp  = db.employees.find(e => e._id === a.empId);
                  const team = db.teams.find(t => t._id === a.teamId);
                  return (
                    <div key={a._id} className="py-2 border-b" style={{ borderColor: 'var(--border2)' }}>
                      <div className="text-sm font-semibold" style={{ color: 'var(--text-bright)' }}>
                        {emp ? `${emp.nombre} ${emp.apellido}` : '—'}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {emp?.cargo || ''}
                        {team && <span style={{ color: team.color }}> · {team.name}</span>}
                      </div>
                      {a.motivo && <div className="text-xs mt-1" style={{ color: 'var(--warning)' }}>📝 {a.motivo}</div>}
                    </div>
                  );
                })
              ];
            });
            return content.length > 0 ? content
              : <div className="text-center py-8 text-sm" style={{ color: 'var(--text-muted)' }}>📭 Sin registros para este día</div>;
          })()}
        </Modal>
      )}
    </div>
  );
}
