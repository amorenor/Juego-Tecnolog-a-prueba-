import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Correo y contraseña son requeridos' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(401).json({ error: 'Credenciales incorrectas' });

    const valid = await user.comparePassword(password);
    if (!valid) return res.status(401).json({ error: 'Credenciales incorrectas' });

    const payload = {
      id:     user._id.toString(),
      email:  user.email,
      name:   user.name,
      role:   user.role,
      teamId: user.teamId,
      empId:  user.empId,
      modules: user.modules,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    });

    res.json({ token, user: user.toJSON() });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Validate token and return refreshed user data
router.get('/me', async (req, res) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'No autorizado' });
  try {
    const payload = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    const user = await User.findById(payload.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ user: user.toJSON() });
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
});

export default router;
