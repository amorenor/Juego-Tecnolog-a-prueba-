import { NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';

const NAV_ITEMS = [
  { mod: 'home',     path: '/home',     icon: '🏠', label: 'Inicio'   },
  { mod: 'equipos',  path: '/equipos',  icon: '👥', label: 'Equipos'  },
  { mod: 'planner',  path: '/planner',  icon: '📋', label: 'Semana'   },
  { mod: 'calendar', path: '/calendar', icon: '📅', label: 'Gerencia' },
  { mod: 'permisos', path: '/permisos', icon: '🔐', label: 'Permisos' },
];

export default function NavBar() {
  const { user } = useApp();
  const mods = user?.modules || [];
  const visible = NAV_ITEMS.filter(n => mods.includes(n.mod));

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex justify-around items-center px-2 py-1"
      style={{
        background: 'rgba(26,29,38,0.97)',
        borderTop: '1px solid var(--border2)',
        backdropFilter: 'blur(12px)',
        height: '64px',
      }}
    >
      {visible.map(({ mod, path, icon, label }) => (
        <NavLink
          key={mod}
          to={path}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all text-xs font-medium ` +
            (isActive
              ? 'text-accent'
              : 'text-[var(--text-muted)] hover:text-[var(--text)]')
          }
        >
          {({ isActive }) => (
            <>
              <span
                className="text-xl w-9 h-9 flex items-center justify-center rounded-xl transition-all"
                style={isActive ? { background: 'rgba(59,158,255,0.15)' } : {}}
              >{icon}</span>
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
