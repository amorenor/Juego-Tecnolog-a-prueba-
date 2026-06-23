const BASE = (import.meta.env.VITE_API_URL || '') + '/api';

function getToken() { return localStorage.getItem('eq_token'); }

async function request(method, path, body) {
  const token = getToken();
  try {
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
  } catch (err) {
    if (err.status) throw err;
    throw new Error('Error de conexión con el servidor');
  }
}

export const api = {
  login:  (email, password) => request('POST', '/auth/login', { email, password }),
  me:     ()                => request('GET',  '/auth/me'),

  getTeams:    ()         => request('GET',    '/teams'),
  createTeam:  (data)     => request('POST',   '/teams', data),
  updateTeam:  (id, data) => request('PUT',    `/teams/${id}`, data),
  deleteTeam:  (id)       => request('DELETE', `/teams/${id}`),

  getEmployees:   ()           => request('GET',    '/employees'),
  createEmployee: (data)       => request('POST',   '/employees', data),
  updateEmployee: (id, data)   => request('PUT',    `/employees/${id}`, data),
  deleteEmployee: (id)         => request('DELETE', `/employees/${id}`),

  addCommitment:    (empId, type, data)      => request('POST',   `/employees/${empId}/commitments/${type}`, data),
  updateCommitment: (empId, type, cid, data) => request('PUT',    `/employees/${empId}/commitments/${type}/${cid}`, data),
  deleteCommitment: (empId, type, cid)       => request('DELETE', `/employees/${empId}/commitments/${type}/${cid}`),

  getAttendance:    ()     => request('GET',    '/attendance'),
  createAttendance: (data) => request('POST',   '/attendance', data),
  deleteAttendance: (id)   => request('DELETE', `/attendance/${id}`),

  getUsers:     ()         => request('GET',    '/users'),
  createUser:   (data)     => request('POST',   '/users', data),
  updateUser:   (id, data) => request('PUT',    `/users/${id}`, data),
  patchModules: (id, mods) => request('PATCH',  `/users/${id}/modules`, { modules: mods }),
  deleteUser:   (id)       => request('DELETE', `/users/${id}`),
};
