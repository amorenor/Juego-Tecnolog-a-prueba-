import { db, sel } from '../state.js';
import { daysUntilNextOccurrence, fmtDate } from '../utils.js';

export function renderHome() {
  const totalEmp = db.employees.length;
  const totalObj = db.employees.reduce((a, e) => a + (e.objetivos || []).length, 0);
  const totalCap = db.employees.reduce((a, e) => a + (e.capacitaciones || []).length, 0);
  const pending  = db.employees.reduce((a, e) =>
    a + (e.objetivos     || []).filter(o => o.estado === 'Pendiente').length +
        (e.capacitaciones || []).filter(c => c.estado === 'Pendiente').length, 0);

  document.getElementById('home-stats').innerHTML = `
    <div class="stat-box"><div class="stat-val">${db.teams.length}</div><div class="stat-lbl">Equipos</div></div>
    <div class="stat-box"><div class="stat-val">${totalEmp}</div><div class="stat-lbl">Personas</div></div>
    <div class="stat-box"><div class="stat-val">${totalObj}</div><div class="stat-lbl">Objetivos</div></div>
    <div class="stat-box"><div class="stat-val">${pending}</div><div class="stat-lbl">Pendientes</div></div>
  `;

  renderNews();

  const grid = document.getElementById('teams-grid');
  if (!db.teams.length) {
    grid.innerHTML = '<div class="empty"><div class="empty-icon">👥</div><p>Agrega tu primer equipo</p></div>';
    return;
  }
  grid.innerHTML = db.teams.map(t => {
    const members  = db.employees.filter(e => e.teamId === t._id);
    const leader   = t.leadId ? db.employees.find(e => e._id === t.leadId) : null;
    const pendObj  = members.reduce((a, e) => a + (e.objetivos || []).filter(o => o.estado === 'Pendiente').length, 0);
    return `<div class="team-tile" style="--team-color:${t.color}" onclick="openTeam('${t._id}')">
      <div class="team-name">${t.name}</div>
      ${leader ? `<div style="font-size:.8rem;color:var(--text-muted)">👑 Líder: ${leader.nombre} ${leader.apellido}</div>` : ''}
      <div class="team-stats">
        <div class="team-stat"><div class="team-stat-val">${members.length}</div><div class="team-stat-lbl">Personas</div></div>
        <div class="team-stat"><div class="team-stat-val">${members.reduce((a, e) => a + (e.objetivos || []).length, 0)}</div><div class="team-stat-lbl">Objetivos</div></div>
        <div class="team-stat"><div class="team-stat-val">${pendObj}</div><div class="team-stat-lbl">Pendientes</div></div>
      </div>
    </div>`;
  }).join('');
}

function renderNews() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];
  const DAYS_AHEAD = 7;
  const news = [], recs = [];

  db.employees.forEach(emp => {
    const name     = `${emp.nombre} ${emp.apellido}`;
    const team     = db.teams.find(t => t._id === emp.teamId);
    const teamName = team ? team.name : '';

    // Birthdays
    if (emp.nacimiento) {
      const born = new Date(emp.nacimiento + 'T00:00:00');
      const age  = today.getFullYear() - born.getFullYear();
      const d    = daysUntilNextOccurrence(born.getMonth(), born.getDate(), today);
      if (d === 0)
        news.push({ p: 1, color: 'success', icon: '🎂', title: `¡Hoy es el cumpleaños de ${name}!`, desc: `Cumple ${age} años · ${teamName}` });
      else if (d <= DAYS_AHEAD)
        news.push({ p: 3, color: 'info', icon: '🎂', title: `Cumpleaños próximo: ${name}`, desc: `En ${d} día${d > 1 ? 's' : ''} cumple ${age} años · ${teamName}` });
    }

    // Work anniversary
    if (emp.ingreso) {
      const start = new Date(emp.ingreso + 'T00:00:00');
      const years = today.getFullYear() - start.getFullYear();
      if (years > 0) {
        const d = daysUntilNextOccurrence(start.getMonth(), start.getDate(), today);
        if (d === 0)
          news.push({ p: 1, color: 'success', icon: '🏆', title: `¡Aniversario laboral de ${name}!`, desc: `Hoy cumple ${years} año${years > 1 ? 's' : ''} en AquaChile · ${teamName}` });
        else if (d <= DAYS_AHEAD)
          news.push({ p: 3, color: 'info', icon: '🏆', title: `Aniversario próximo: ${name}`, desc: `En ${d} día${d > 1 ? 's' : ''} cumple ${years} año${years > 1 ? 's' : ''} en la empresa · ${teamName}` });
      }
    }

    // Scheduled 1:1 today
    (emp.conversaciones || []).forEach(c => {
      if (c.proximaFecha === todayStr)
        news.push({ p: 1, color: 'warning', icon: '📅', title: `Conversación 1:1 programada hoy con ${name}`, desc: `Tipo: ${c.tipo || '1:1'} · ${teamName}` });
    });

    // Overdue/upcoming objectives
    (emp.objetivos || []).forEach(obj => {
      if (!obj.fechaLimite || obj.estado === 'Completado' || obj.estado === 'Cancelado') return;
      const due  = new Date(obj.fechaLimite + 'T00:00:00');
      const diff = Math.round((due - today) / (1000 * 60 * 60 * 24));
      if (diff < 0)
        news.push({ p: 1, color: 'danger', icon: '⚠️', title: `Objetivo vencido: ${name}`, desc: `"${obj.titulo}" · venció hace ${Math.abs(diff)} día${Math.abs(diff) > 1 ? 's' : ''}` });
      else if (diff === 0)
        news.push({ p: 1, color: 'warning', icon: '📋', title: `Objetivo vence hoy: ${name}`, desc: `"${obj.titulo}"` });
      else if (diff <= DAYS_AHEAD)
        news.push({ p: 2, color: 'warning', icon: '📋', title: `Objetivo por vencer: ${name}`, desc: `"${obj.titulo}" · vence en ${diff} días` });
    });

    // Overdue capacitaciones
    (emp.capacitaciones || []).forEach(cap => {
      if (!cap.fechaFin || cap.estado === 'Completado' || cap.estado === 'Cancelado') return;
      const due  = new Date(cap.fechaFin + 'T00:00:00');
      const diff = Math.round((due - today) / (1000 * 60 * 60 * 24));
      if (diff === 0)
        news.push({ p: 2, color: 'info', icon: '📚', title: `Capacitación finaliza hoy: ${name}`, desc: `"${cap.nombre}"` });
      else if (diff < 0 && cap.estado === 'En curso')
        news.push({ p: 2, color: 'warning', icon: '📚', title: `Capacitación vencida: ${name}`, desc: `"${cap.nombre}" debería haber terminado hace ${Math.abs(diff)} días` });
    });

    // 1:1 recommendations
    const convs = emp.conversaciones || [];
    if (!convs.length) {
      recs.push({ p: 5, color: 'info', icon: '💬', title: `Recomendación: agenda una 1:1 con ${name}`, desc: `Sin conversaciones registradas · ${teamName}` });
    } else {
      const last = convs.filter(c => c.fecha).sort((a, b) => b.fecha.localeCompare(a.fecha))[0];
      if (last) {
        const daysSince = Math.round((today - new Date(last.fecha + 'T00:00:00')) / (1000 * 60 * 60 * 24));
        if (daysSince >= 30)
          recs.push({ p: 4, color: 'info', icon: '💬', title: `Recomendación: reunirse con ${name}`, desc: `Hace ${daysSince} días sin conversación registrada · ${teamName}` });
      }
    }
  });

  recs.slice(0, 3).forEach(r => news.push(r));
  news.sort((a, b) => a.p - b.p);

  const dias   = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const meses  = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  document.getElementById('news-date').textContent =
    `${dias[today.getDay()]} ${today.getDate()} de ${meses[today.getMonth()]} de ${today.getFullYear()}`;

  const container = document.getElementById('news-container');
  if (!news.length) {
    container.innerHTML = `<div class="news-empty">✓ Sin eventos relevantes para hoy. ¡Buen día!</div>`;
    return;
  }
  container.innerHTML = news.slice(0, 12).map(n => `
    <div class="news-item news-${n.color}">
      <span class="news-icon">${n.icon}</span>
      <div>
        <div class="news-title">${n.title}</div>
        <div class="news-desc">${n.desc}</div>
      </div>
    </div>`).join('');
}
