import { api } from './api.js';
import { db } from './state.js';
import { toast, showLoading } from './utils.js';

const TOKEN_KEY = 'eq_token';
const USER_KEY  = 'eq_user_v2';

export function getStoredUser() {
  try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
}

function storeSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function updateNavVisibility(user) {
  const mods = user?.modules || [];
  const map = {
    home:     'nav-home',
    equipos:  'nav-equipos',
    planner:  'nav-planner',
    calendar: 'nav-calendar',
    permisos: 'nav-permisos',
  };
  Object.entries(map).forEach(([mod, id]) => {
    const el = document.getElementById(id);
    if (el) el.style.display = mods.includes(mod) ? '' : 'none';
  });
  document.getElementById('nav-emp').style.display = 'none';
}

// Load all data from the API after successful login
export async function loadAppData(user) {
  showLoading(true);
  try {
    const [teams, employees, attendance] = await Promise.all([
      api.getTeams(),
      api.getEmployees(),
      api.getAttendance(),
    ]);
    db.teams      = teams;
    db.employees  = employees;
    db.attendance = attendance;

    if (user.role === 'manager') {
      db.users = await api.getUsers();
    }
  } finally {
    showLoading(false);
  }
}

export async function attemptLogin() {
  const email = (document.getElementById('login-email')?.value || '').trim().toLowerCase();
  const pass  = document.getElementById('login-pass')?.value || '';
  const errEl = document.getElementById('login-err');
  const card  = document.getElementById('login-card');

  errEl.style.display = 'none';

  if (!email || !pass) {
    errEl.textContent = 'Ingresa tu correo y contraseña.';
    errEl.style.display = 'block';
    return;
  }

  showLoading(true);
  try {
    const { token, user } = await api.login(email, pass);

    // Build session object compatible with existing rendering code
    const session = {
      type:    user.role,
      name:    user.name,
      empId:   user.empId  || null,
      teamId:  user.teamId || null,
      modules: user.modules,
      role:    user.role,
    };

    storeSession(token, session);
    await loadAppData(session);

    updateNavVisibility(session);
    const first = session.modules?.[0] || 'home';
    window.showScreen(first);
    window.setNav('nav-' + first);
  } catch (err) {
    errEl.textContent = err.status === 401
      ? 'Correo o contraseña incorrectos.'
      : (err.message || 'Error de conexión con el servidor.');
    errEl.style.display = 'block';
    if (card) {
      card.style.animation = 'none';
      requestAnimationFrame(() => { card.style.animation = 'shake .35s ease'; });
    }
  } finally {
    showLoading(false);
  }
}

export function doLogout() {
  clearSession();
  db.teams = []; db.employees = []; db.attendance = []; db.users = [];
  ['nav-home', 'nav-equipos', 'nav-planner', 'nav-calendar'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = '';
  });
  document.getElementById('nav-permisos').style.display = 'none';
  document.getElementById('nav-emp').style.display = 'none';
  window.showScreen('login');
}

export function clearLoginErr() {
  const el = document.getElementById('login-err');
  if (el) el.style.display = 'none';
}

export function toggleLoginPass() {
  const inp = document.getElementById('login-pass');
  if (inp) inp.type = inp.type === 'password' ? 'text' : 'password';
}
