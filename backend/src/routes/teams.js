import { Router } from 'express';
import Team from '../models/Team.js';
import Employee from '../models/Employee.js';
import { authenticate, requireManager } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

// All authenticated users can read teams
router.get('/', async (req, res) => {
  try {
    const teams = await Team.find().sort({ name: 1 });
    res.json(teams);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener equipos' });
  }
});

// Only managers can create/edit/delete teams
router.post('/', requireManager, async (req, res) => {
  try {
    const team = await Team.create(req.body);
    res.status(201).json(team);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', requireManager, async (req, res) => {
  try {
    const team = await Team.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!team) return res.status(404).json({ error: 'Equipo no encontrado' });
    res.json(team);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', requireManager, async (req, res) => {
  try {
    const members = await Employee.countDocuments({ teamId: req.params.id });
    if (members > 0) {
      return res.status(409).json({ error: `No se puede eliminar — el equipo tiene ${members} persona(s)` });
    }
    await Team.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar equipo' });
  }
});

export default router;
