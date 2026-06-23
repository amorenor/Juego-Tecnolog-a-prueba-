import { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext.jsx';
import NavBar from './components/NavBar.jsx';
import Login from './pages/Login.jsx';
import Home from './pages/Home.jsx';
import Equipos from './pages/Equipos.jsx';
import Employee from './pages/Employee.jsx';
import Planner from './pages/Planner.jsx';
import Calendar from './pages/Calendar.jsx';
import Permisos from './pages/Permisos.jsx';

function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3"
      style={{ background: 'rgba(15,17,23,0.85)', backdropFilter: 'blur(4px)' }}>
      <div className="w-10 h-10 rounded-full border-4 border-t-accent"
        style={{ borderColor: 'var(--border2)', borderTopColor: 'var(--accent)', animation: 'spin 0.8s linear infinite' }} />
      <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Cargando…</span>
    </div>
  );
}

function Toast() {
  const { toastMsg } = useApp();
  return <div className={`toast ${toastMsg ? 'show' : ''}`}>{toastMsg}</div>;
}

function PrivateRoute({ mod, children }) {
  const { user } = useApp();
  if (!user) return <Navigate to="/login" replace />;
  if (mod && !user.modules?.includes(mod)) return <Navigate to={`/${user.modules?.[0] || 'home'}`} replace />;
  return children;
}

function AppContent() {
  const { user, loading, restoreSession } = useApp();

  useEffect(() => { restoreSession(); }, []); // eslint-disable-line

  return (
    <>
      {loading && <LoadingOverlay />}
      <Toast />
      <Routes>
        <Route path="/login" element={user ? <Navigate to={`/${user.modules?.[0] || 'home'}`} replace /> : <Login />} />
        <Route path="/" element={<Navigate to={user ? `/${user.modules?.[0] || 'home'}` : '/login'} replace />} />
        <Route path="/home"     element={<PrivateRoute mod="home">    <Home />     </PrivateRoute>} />
        <Route path="/equipos"  element={<PrivateRoute mod="equipos"> <Equipos />  </PrivateRoute>} />
        <Route path="/employee/:id" element={<PrivateRoute><Employee /></PrivateRoute>} />
        <Route path="/planner"  element={<PrivateRoute mod="planner"> <Planner />  </PrivateRoute>} />
        <Route path="/calendar" element={<PrivateRoute mod="calendar"><Calendar /> </PrivateRoute>} />
        <Route path="/permisos" element={<PrivateRoute mod="permisos"><Permisos /> </PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {user && <NavBar />}
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </AppProvider>
  );
}
