// ── API Client ────────────────────────────────────────────────────────────────
// In dev, Vite proxy forwards /api → backend (localhost:3001)
// In production, set VITE_API_URL in the build environment
const BASE = (import.meta.env.VITE_API_URL || '') + '/api';

function getToken() {
  return localStorage.getItem('eq_token');
}

async function request(method, path, body) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({ error: 'Error de red' }));

  if (!res.ok) {
    const err = new Error(data.error || `Error ${res.status}`);
    err.status = res.status;
    throw err;
  }

  return data;
}

export const api = {
  // ── Auth ───────────────────────────────────────────────────────────────────
  login:  (email, password) => request('POST', '/auth/login', { email, password }),
  me:     ()                => request('GET',  '/auth/me'),

  // ── Teams ──────────────────────────────────────────────────────────────────
  getTeams:    ()         => request('GET',    '/teams'),
  createTeam:  (data)     => request('POST',   '/teams', data),
  updateTeam:  (id, data) => request('PUT',    `/teams/${id}`, data),
  deleteTeam:  (id)       => request('DELETE', `/teams/${id}`),

  // ── Employees ──────────────────────────────────────────────────────────────
  getEmployees:   (teamId) => request('GET',    `/employees${teamId ? '?teamId=' + teamId : ''}`),
  createEmployee: (data)   => request('POST',   '/employees', data),
  updateEmployee: (id, data) => request('PUT',  `/employees/${id}`, data),
  deleteEmployee: (id)     => request('DELETE', `/employees/${id}`),

  // ── Commitments (nested under employee) ────────────────────────────────────
  addCommitment:    (empId, type, data)      => request('POST',   `/employees/${empId}/commitments/${type}`, data),
  updateCommitment: (empId, type, cid, data) => request('PUT',    `/employees/${empId}/commitments/${type}/${cid}`, data),
  deleteCommitment: (empId, type, cid)       => request('DELETE', `/employees/${empId}/commitments/${type}/${cid}`),

  // ── Attendance ─────────────────────────────────────────────────────────────
  getAttendance:    (params = {}) => request('GET',    `/attendance?${new URLSearchParams(params)}`),
  createAttendance: (data)        => request('POST',   '/attendance', data),
  deleteAttendance: (id)          => request('DELETE', `/attendance/${id}`),

  // ── Users (admin only) ─────────────────────────────────────────────────────
  getUsers:      ()         => request('GET',    '/users'),
  createUser:    (data)     => request('POST',   '/users', data),
  updateUser:    (id, data) => request('PUT',    `/users/${id}`, data),
  patchModules:  (id, mods) => request('PATCH',  `/users/${id}/modules`, { modules: mods }),
  deleteUser:    (id)       => request('DELETE', `/users/${id}`),
};
