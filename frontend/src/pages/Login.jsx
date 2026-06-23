import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';

export default function Login() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [pass, setPass]   = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const cardRef = useRef(null);

  async function handleLogin() {
    setError('');
    if (!email || !pass) { setError('Ingresa tu correo y contraseña.'); return; }
    setLoading(true);
    try {
      const session = await login(email.trim().toLowerCase(), pass);
      navigate(`/${session.modules?.[0] || 'home'}`, { replace: true });
    } catch (err) {
      setError(err.status === 401 ? 'Correo o contraseña incorrectos.' : (err.message || 'Error de conexión.'));
      setShake(true);
      setTimeout(() => setShake(false), 400);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 pb-8">
      <div className="mb-8 text-center">
        <div className="text-4xl font-black mb-1" style={{ color: 'var(--text-bright)' }}>👥 Mi Equipo</div>
        <div className="text-sm" style={{ color: 'var(--text-muted)' }}>AquaChile · Gestión del ciclo de vida laboral</div>
      </div>

      <div
        ref={cardRef}
        className="w-full max-w-sm rounded-2xl p-6"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border2)',
          animation: shake ? 'shake .35s ease' : 'none',
        }}
      >
        <div className="text-xs font-bold tracking-widest mb-5" style={{ color: 'var(--accent)' }}>INICIAR SESIÓN</div>

        <div className="mb-4">
          <label className="block text-xs font-semibold tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
            CORREO ELECTRÓNICO
          </label>
          <input
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="correo@aquachile.com"
            className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
            style={{ background: 'var(--surface2)', border: '1px solid var(--border2)', color: 'var(--text-bright)' }}
          />
        </div>

        <div className="mb-4">
          <label className="block text-xs font-semibold tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
            CONTRASEÑA
          </label>
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              value={pass}
              onChange={e => { setPass(e.target.value); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="••••••••"
              className="w-full rounded-xl px-4 py-3 pr-20 text-sm outline-none"
              style={{ background: 'var(--surface2)', border: '1px solid var(--border2)', color: 'var(--text-bright)' }}
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold px-2 py-1 rounded"
              style={{ color: 'var(--text-muted)' }}
            >Mostrar</button>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl px-4 py-3 text-sm text-center"
            style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', color: 'var(--danger)' }}>
            {error}
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-60"
          style={{ background: 'linear-gradient(90deg, var(--accent), #1e6fcf)' }}
        >
          {loading ? 'Ingresando…' : 'Ingresar →'}
        </button>

        <p className="mt-4 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
          ¿Problemas para ingresar? Contacta al administrador.<br/>
          Próximamente: integración con Microsoft Entra ID.
        </p>
      </div>
    </div>
  );
}
