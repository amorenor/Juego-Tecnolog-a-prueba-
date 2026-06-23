import { createContext, useContext, useState, useCallback } from 'react';
import { api } from '../api/index.js';

const TOKEN_KEY = 'eq_token';
const USER_KEY  = 'eq_user_v2';

export function getStoredUser() {
  try {
    const u = JSON.parse(localStorage.getItem(USER_KEY));
    return u?.modules ? u : null;
  } catch { return null; }
}

function storeSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser]       = useState(getStoredUser);
  const [db, setDb]           = useState({ teams: [], employees: [], attendance: [], users: [] });
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  const toast = useCallback((msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2200);
  }, []);

  const loadAppData = useCallback(async (sessionUser) => {
    setLoading(true);
    try {
      const [teams, employees, attendance] = await Promise.all([
        api.getTeams(),
        api.getEmployees(),
        api.getAttendance(),
      ]);
      const newDb = { teams, employees, attendance, users: [] };
      if (sessionUser.role === 'manager') {
        newDb.users = await api.getUsers();
      }
      setDb(newDb);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const { token, user: u } = await api.login(email, password);
    const session = {
      type: u.role, name: u.name, empId: u.empId || null,
      teamId: u.teamId || null, modules: u.modules, role: u.role,
    };
    storeSession(token, session);
    setUser(session);
    await loadAppData(session);
    return session;
  }, [loadAppData]);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    setDb({ teams: [], employees: [], attendance: [], users: [] });
  }, []);

  // Restore session on mount if user exists in localStorage
  const restoreSession = useCallback(async () => {
    const stored = getStoredUser();
    if (stored && !db.teams.length) {
      setLoading(true);
      try {
        await loadAppData(stored);
        setUser(stored);
      } catch {
        clearSession();
        setUser(null);
      }
    }
  }, []); // eslint-disable-line

  return (
    <AppContext.Provider value={{
      user, db, setDb, loading, setLoading,
      toast, toastMsg, login, logout, loadAppData, restoreSession,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
