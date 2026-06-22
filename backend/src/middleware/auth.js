import jwt from 'jsonwebtoken';

export function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autorizado — token requerido' });
  }

  try {
    const token = header.split(' ')[1];
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

export function requireManager(req, res, next) {
  if (req.user?.role !== 'manager') {
    return res.status(403).json({ error: 'Acceso restringido a gerentes' });
  }
  next();
}

// Leaders can only modify their own team's data
export function requireTeamAccess(req, res, next) {
  if (req.user?.role === 'manager') return next();
  const teamId = req.params.teamId || req.body.teamId;
  if (teamId && teamId !== req.user.teamId) {
    return res.status(403).json({ error: 'Solo puedes modificar tu propio equipo' });
  }
  next();
}
