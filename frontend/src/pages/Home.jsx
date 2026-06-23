import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { daysUntilNextOccurrence, fmtDate } from '../utils/index.js';

const DIAS  = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const DAYS_AHEAD = 7;

function StatBox({ val, lbl }) {
  return (
    <div className="flex-1 rounded-2xl p-4 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--border2)' }}>
      <div className="text-3xl font-black" style={{ color: 'var(--text-bright)' }}>{val}</div>
      <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{lbl}</div>
    </div>
  );
}

export default function Home() {
  const { db, user, logout } = useApp();
  const navigate = useNavigate();

  const stats = useMemo(() => ({
    teams:   db.teams.length,
    emps:    db.employees.length,
    obj:     db.employees.reduce((a, e) => a + (e.objetivos || []).length, 0),
    pending: db.employees.reduce((a, e) =>
      a + (e.objetivos || []).filter(o => o.estado === 'Pendiente').length +
          (e.capacitaciones || []).filter(c => c.estado === 'Pendiente').length, 0),
  }), [db]);

  const { news, todayStr } = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tStr  = today.toISOString().split('T')[0];
    const items = [], recs = [];

    db.employees.forEach(emp => {
      const name     = `${emp.nombre} ${emp.apellido}`;
      const team     = db.teams.find(t => t._id === emp.teamId);
      const teamName = team?.name || '';

      if (emp.nacimiento) {
        const born = new Date(emp.nacimiento + 'T00:00:00');
        const age  = today.getFullYear() - born.getFullYear();
        const d    = daysUntilNextOccurrence(born.getMonth(), born.getDate(), today);
        if (d === 0) items.push({ p: 1, color: 'success', icon: '🎂', title: `¡Hoy es el cumpleaños de ${name}!`, desc: `Cumple ${age} años · ${teamName}` });
        else if (d <= DAYS_AHEAD) items.push({ p: 3, color: 'info', icon: '🎂', title: `Cumpleaños próximo: ${name}`, desc: `En ${d} día${d > 1 ? 's' : ''} cumple ${age} años · ${teamName}` });
      }
      if (emp.ingreso) {
        const start = new Date(emp.ingreso + 'T00:00:00');
        const years = today.getFullYear() - start.getFullYear();
        if (years > 0) {
          const d = daysUntilNextOccurrence(start.getMonth(), start.getDate(), today);
          if (d === 0) items.push({ p: 1, color: 'success', icon: '🏆', title: `¡Aniversario laboral de ${name}!`, desc: `Hoy cumple ${years} año${years > 1 ? 's' : ''} en AquaChile · ${teamName}` });
          else if (d <= DAYS_AHEAD) items.push({ p: 3, color: 'info', icon: '🏆', title: `Aniversario próximo: ${name}`, desc: `En ${d} día${d > 1 ? 's' : ''} cumple ${years} año${years > 1 ? 's' : ''} · ${teamName}` });
        }
      }
      (emp.conversaciones || []).forEach(c => {
        if (c.proximaFecha === tStr) items.push({ p: 1, color: 'warning', icon: '📅', title: `1:1 programada hoy con ${name}`, desc: `Tipo: ${c.tipo || '1:1'} · ${teamName}` });
      });
      (emp.objetivos || []).forEach(obj => {
        if (!obj.fechaLimite || obj.estado === 'Completado' || obj.estado === 'Cancelado') return;
        const diff = Math.round((new Date(obj.fechaLimite + 'T00:00:00') - today) / 86400000);
        if (diff < 0) items.push({ p: 1, color: 'danger', icon: '⚠️', title: `Objetivo vencido: ${name}`, desc: `"${obj.titulo}" · venció hace ${Math.abs(diff)}d` });
        else if (diff === 0) items.push({ p: 1, color: 'warning', icon: '📋', title: `Objetivo vence hoy: ${name}`, desc: `"${obj.titulo}"` });
        else if (diff <= DAYS_AHEAD) items.push({ p: 2, color: 'warning', icon: '📋', title: `Objetivo por vencer: ${name}`, desc: `"${obj.titulo}" · vence en ${diff}d` });
      });
      (emp.capacitaciones || []).forEach(cap => {
        if (!cap.fechaFin || cap.estado === 'Completado' || cap.estado === 'Cancelado') return;
        const diff = Math.round((new Date(cap.fechaFin + 'T00:00:00') - today) / 86400000);
        if (diff === 0) items.push({ p: 2, color: 'info', icon: '📚', title: `Capacitación finaliza hoy: ${name}`, desc: `"${cap.nombre}"` });
        else if (diff < 0 && cap.estado === 'En curso') items.push({ p: 2, color: 'warning', icon: '📚', title: `Capacitación vencida: ${name}`, desc: `"${cap.nombre}"` });
      });
      const convs = (emp.conversaciones || []).filter(c => c.fecha).sort((a, b) => b.fecha.localeCompare(a.fecha));
      if (!convs.length) recs.push({ p: 5, color: 'info', icon: '💬', title: `Recomendación: agenda 1:1 con ${name}`, desc: `Sin conversaciones · ${teamName}` });
      else {
        const daysSince = Math.round((today - new Date(convs[0].fecha + 'T00:00:00')) / 86400000);
        if (daysSince >= 30) recs.push({ p: 4, color: 'info', icon: '💬', title: `Recomendación: reunirse con ${name}`, desc: `Hace ${daysSince} días sin 1:1 · ${teamName}` });
      }
    });

    recs.slice(0, 3).forEach(r => items.push(r));
    items.sort((a, b) => a.p - b.p);
    return { news: items.slice(0, 12), todayStr: tStr };
  }, [db]);

  const today = new Date();
  const colorMap = { success: 'var(--success)', danger: 'var(--danger)', warning: 'var(--warning)', info: 'var(--accent)' };
  const bgMap    = { success: 'rgba(34,197,94,.08)', danger: 'rgba(239,68,68,.08)', warning: 'rgba(245,158,11,.08)', info: 'rgba(59,158,255,.08)' };

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-24">
      {/* Header + logout */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="text-2xl font-black" style={{ color: 'var(--text-bright)' }}>👥 Mi Equipo</div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Gestión del ciclo de vida laboral · AquaChile</div>
        </div>
        <button onClick={logout} className="text-xs px-3 py-1.5 rounded-lg transition-colors"
          style={{ background: 'var(--surface2)', color: 'var(--text-muted)', border: '1px solid var(--border2)' }}>
          Salir
        </button>
      </div>

      {/* Stats */}
      <div className="flex gap-3 mb-6">
        <StatBox val={stats.teams}   lbl="Equipos" />
        <StatBox val={stats.emps}    lbl="Personas" />
        <StatBox val={stats.obj}     lbl="Objetivos" />
        <StatBox val={stats.pending} lbl="Pendientes" />
      </div>

      {/* News */}
      <div className="rounded-2xl p-4 mb-6" style={{ background: 'var(--surface)', border: '1px solid var(--border2)' }}>
        <div className="text-xs font-bold tracking-widest mb-1" style={{ color: 'var(--accent)' }}>NOVEDADES DEL DÍA</div>
        <div className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
          {DIAS[today.getDay()]} {today.getDate()} de {MESES[today.getMonth()]} de {today.getFullYear()}
        </div>
        {news.length === 0
          ? <div className="text-sm py-2" style={{ color: 'var(--text-muted)' }}>✓ Sin eventos relevantes para hoy. ¡Buen día!</div>
          : news.map((n, i) => (
            <div key={i} className="flex gap-3 items-start py-2.5 rounded-xl px-3 mb-1"
              style={{ background: bgMap[n.color], border: `1px solid ${colorMap[n.color]}22` }}>
              <span className="text-base mt-0.5">{n.icon}</span>
              <div>
                <div className="text-xs font-semibold" style={{ color: colorMap[n.color] }}>{n.title}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{n.desc}</div>
              </div>
            </div>
          ))
        }
      </div>

      {/* Teams grid */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-base" style={{ color: 'var(--text-bright)' }}>Equipos</h2>
        <button className="text-xs px-3 py-1.5 rounded-lg" onClick={() => navigate('/equipos')}
          style={{ background: 'var(--surface2)', color: 'var(--text-muted)', border: '1px solid var(--border2)' }}>
          Ver todos
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {db.teams.map(t => {
          const members = db.employees.filter(e => e.teamId === t._id);
          const leader  = t.leadId ? db.employees.find(e => e._id === t.leadId) : null;
          const pendObj = members.reduce((a, e) => a + (e.objetivos || []).filter(o => o.estado === 'Pendiente').length, 0);
          return (
            <div key={t._id} onClick={() => navigate('/equipos')}
              className="rounded-2xl p-4 cursor-pointer transition-all hover:scale-[1.01]"
              style={{ background: 'var(--surface)', border: `2px solid ${t.color}33` }}>
              <div className="font-bold text-sm mb-1" style={{ color: t.color }}>{t.name}</div>
              {leader && <div className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>👑 {leader.nombre} {leader.apellido}</div>}
              <div className="flex gap-4">
                {[['Personas', members.length], ['Objetivos', members.reduce((a,e)=>a+(e.objetivos||[]).length,0)], ['Pendientes', pendObj]].map(([lbl, val]) => (
                  <div key={lbl} className="text-center">
                    <div className="font-black text-lg" style={{ color: 'var(--text-bright)' }}>{val}</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{lbl}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
