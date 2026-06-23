import jwt from 'jsonwebtoken';

export function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autorizado — token requerido' });
  }

  try {
    const token = header.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Reject tokens issued before JWT_SECRET was last rotated (if env var set)
    if (process.env.JWT_NOT_BEFORE && payload.iat < Number(process.env.JWT_NOT_BEFORE)) {
      return res.status(401).json({ error: 'Sesión expirada. Vuelve a iniciar sesión.' });
    }

    req.user = payload;
    next();
  } catch (err) {
    const msg = err.name === 'TokenExpiredError'
      ? 'Sesión expirada. Vuelve a iniciar sesión.'
      : 'Token inválido';
    res.status(401).json({ error: msg });
  }
}

export function requireManager(req, res, next) {
  if (req.user?.role !== 'manager') {
    return res.status(403).json({ error: 'Acceso restringido a gerentes' });
  }
  next();
}

export function requireTeamAccess(req, res, next) {
  if (req.user?.role === 'manager') return next();
  const teamId = req.params.teamId || req.body.teamId;
  if (teamId && teamId !== req.user.teamId) {
    return res.status(403).json({ error: 'Solo puedes modificar tu propio equipo' });
  }
  next();
}
