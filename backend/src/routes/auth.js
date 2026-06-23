import { Router } from 'express';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';

const router = Router();

// ── Rate limit: 5 intentos de login por IP cada 15 minutos ───────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // solo cuenta los intentos fallidos
  message: { error: 'Demasiados intentos fallidos. Espera 15 minutos.' },
  handler: (req, res, _next, options) => {
    console.warn(`[SEGURIDAD] Login bloqueado por rate limit — IP: ${req.ip} — ${new Date().toISOString()}`);
    res.status(options.statusCode).json(options.message);
  },
});

// ── Validación de inputs ──────────────────────────────────────────────────────
const loginValidation = [
  body('email')
    .isEmail().withMessage('Correo inválido')
    .normalizeEmail()
    .isLength({ max: 254 }),
  body('password')
    .isString()
    .isLength({ min: 1, max: 128 }).withMessage('Contraseña inválida'),
];

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post('/login', loginLimiter, loginValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Correo o contraseña inválidos' });
  }

  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      console.warn(`[SEGURIDAD] Login fallido — correo no existe: ${email} — IP: ${req.ip}`);
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const valid = await user.comparePassword(password);
    if (!valid) {
      console.warn(`[SEGURIDAD] Login fallido — contraseña incorrecta: ${email} — IP: ${req.ip}`);
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const payload = {
      id:      user._id.toString(),
      email:   user.email,
      name:    user.name,
      role:    user.role,
      teamId:  user.teamId,
      empId:   user.empId,
      modules: user.modules,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    });

    console.info(`[AUTH] Login exitoso — ${email} — IP: ${req.ip}`);
    res.json({ token, user: user.toJSON() });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
router.get('/me', async (req, res) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autorizado' });
  }
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
