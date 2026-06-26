import { Router } from 'express';
import { Team, Employee } from '../models/index.js';
import { authenticate, requireManager } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const teams = await Team.findAll({ order: [['name', 'ASC']] });
    res.json(teams);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener equipos' });
  }
});

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
    const team = await Team.findByPk(req.params.id);
    if (!team) return res.status(404).json({ error: 'Equipo no encontrado' });
    const { _id, ...fields } = req.body;
    await team.update(fields);
    res.json(team);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', requireManager, async (req, res) => {
  try {
    const members = await Employee.count({ where: { teamId: req.params.id } });
    if (members > 0) {
      return res.status(409).json({ error: `No se puede eliminar — el equipo tiene ${members} persona(s)` });
    }
    await Team.destroy({ where: { _id: req.params.id } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar equipo' });
  }
});

export default router;
