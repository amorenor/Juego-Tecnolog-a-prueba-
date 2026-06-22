import { db, sel } from './state.js';
import { getStoredUser, loadAppData, updateNavVisibility, attemptLogin, doLogout, clearLoginErr, toggleLoginPass } from './auth.js';
import { renderHome } from './screens/home.js';
import { renderEquipos, setEqPill, filterEquipos, renderEquiposPanels, openTeamForm, saveTeam, editTeamFromEq, editCurrentTeam } from './screens/equipos.js';
import { renderEmployee, openEmployeeForm, saveEmployee, deleteEmployee, openCommitForm, saveCommit, deleteCommit, addEmpToTeam, openEmpEditFromEq, openCommitFromEq, openEmployee, backToTeam, filterMembers, showTab } from './screens/employee.js';
import { renderPlanner, setPlannerTeam, changeWeek, toggleAtt, saveCompensado, cancelCompensado } from './screens/planner.js';
import { renderCalendar, setCalView, changeMonth, showDayDetail } from './screens/calendar.js';
import { renderPermisos, toggleUserMod, openUserForm, updateUfTeamWrap, saveUser, deleteUser, toggleUfPass } from './screens/permisos.js';
import { closeModal, openModal } from './utils.js';

// ── Screen navigation ────────────────────────────────────────────────────────

function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById('screen-' + name);
  if (el) el.classList.add('active');
  const nav = document.querySelector('.nav-bar');
  if (nav) nav.style.display = name === 'login' ? 'none' : '';
  if (name === 'home')      renderHome();
  if (name === 'equipos')   renderEquipos();
  if (name === 'planner')   renderPlanner();
  if (name === 'calendar')  renderCalendar();
  if (name === 'permisos')  renderPermisos();
}

function setNav(id) {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}

function openTeam(teamId) {
  sel.currentTeamId = teamId;
  showScreen('equipos');
  setNav('nav-equipos');
}

// ── Modal outside-click to close ─────────────────────────────────────────────

document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) {
      const id = overlay.id;
      if (id === 'modal-compensado') cancelCompensado();
      else closeModal(id);
    }
  });
});

// ── Expose all functions to window (needed for inline onclick handlers) ───────

Object.assign(window, {
  // Auth
  attemptLogin,
  doLogout,
  clearLoginErr,
  toggleLoginPass,

  // Navigation
  showScreen,
  setNav,
  openTeam,
  openModal,
  closeModal,

  // Home
  renderHome,

  // Equipos
  renderEquipos,
  setEqPill,
  filterEquipos,
  renderEquiposPanels,
  openTeamForm,
  saveTeam,
  editTeamFromEq,
  editCurrentTeam,

  // Employee
  renderEmployee,
  openEmployee,
  openEmployeeForm,
  saveEmployee,
  deleteEmployee,
  openCommitForm,
  saveCommit,
  deleteCommit,
  addEmpToTeam,
  openEmpEditFromEq,
  openCommitFromEq,
  backToTeam,
  filterMembers,
  showTab,

  // Planner
  renderPlanner,
  setPlannerTeam,
  changeWeek,
  toggleAtt,
  saveCompensado,
  cancelCompensado,

  // Calendar
  renderCalendar,
  setCalView,
  changeMonth,
  showDayDetail,

  // Permisos
  renderPermisos,
  toggleUserMod,
  openUserForm,
  updateUfTeamWrap,
  saveUser,
  deleteUser,
  toggleUfPass,
});

// ── Boot ─────────────────────────────────────────────────────────────────────

(async function boot() {
  const user = getStoredUser();
  if (user) {
    try {
      await loadAppData(user);
      updateNavVisibility(user);
      const first = user.modules?.[0] || 'home';
      showScreen(first);
      setNav('nav-' + first);
    } catch {
      // Token expired or server unavailable — fall through to login
      showScreen('login');
    }
  } else {
    showScreen('login');
  }
})();
