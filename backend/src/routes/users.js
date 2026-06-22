import { Router } from 'express';
import User from '../models/User.js';
import { authenticate, requireManager } from '../middleware/auth.js';

const router = Router();
router.use(authenticate, requireManager);

router.get('/', async (req, res) => {
  try {
    const users = await User.find().sort({ name: 1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

router.post('/', async (req, res) => {
  try {
    const exists = await User.findOne({ email: req.body.email?.toLowerCase() });
    if (exists) return res.status(409).json({ error: 'Ese correo ya está registrado' });

    const user = await User.create(req.body);
    res.status(201).json(user.toJSON());
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const { password, ...fields } = req.body;
    Object.assign(user, fields);
    if (password) user.password = password;

    await user.save();
    res.json(user.toJSON());
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.patch('/:id/modules', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { modules: req.body.modules } },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(user.toJSON());
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: 'No puedes eliminarte a ti mismo' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});

export default router;
