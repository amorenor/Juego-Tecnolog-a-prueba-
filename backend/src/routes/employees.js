import { Router } from 'express';
import Employee from '../models/Employee.js';
import Team from '../models/Team.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

const COMMIT_KEYS = {
  objetivo: 'objetivos',
  conversacion: 'conversaciones',
  capacitacion: 'capacitaciones',
  reconocimiento: 'reconocimientos',
};

// Get all employees, optional teamId filter
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.teamId) filter.teamId = req.query.teamId;
    // Leaders can only see their team
    if (req.user.role === 'leader' && !req.query.teamId) {
      filter.teamId = req.user.teamId;
    }
    const employees = await Employee.find(filter).sort({ apellido: 1, nombre: 1 });
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener personas' });
  }
});

router.post('/', async (req, res) => {
  try {
    // Leaders can only add to their own team
    if (req.user.role === 'leader' && req.body.teamId !== req.user.teamId) {
      return res.status(403).json({ error: 'Solo puedes agregar personas a tu equipo' });
    }
    const emp = await Employee.create({
      ...req.body,
      objetivos: [],
      conversaciones: [],
      capacitaciones: [],
      reconocimientos: [],
    });
    res.status(201).json(emp);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const emp = await Employee.findById(req.params.id);
    if (!emp) return res.status(404).json({ error: 'Persona no encontrada' });
    if (req.user.role === 'leader' && emp.teamId !== req.user.teamId) {
      return res.status(403).json({ error: 'Solo puedes editar personas de tu equipo' });
    }
    // Protect commitment arrays from being overwritten accidentally
    const { objetivos, conversaciones, capacitaciones, reconocimientos, ...safeFields } = req.body;
    const updated = await Employee.findByIdAndUpdate(req.params.id, safeFields, { new: true, runValidators: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const emp = await Employee.findById(req.params.id);
    if (!emp) return res.status(404).json({ error: 'Persona no encontrada' });
    if (req.user.role === 'leader' && emp.teamId !== req.user.teamId) {
      return res.status(403).json({ error: 'Solo puedes eliminar personas de tu equipo' });
    }
    await Employee.findByIdAndDelete(req.params.id);
    // Clear leadId from team if this employee was the leader
    await Team.updateMany({ leadId: req.params.id }, { $set: { leadId: '' } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar persona' });
  }
});

// ── Commitment sub-routes ───────────────────────────────────────────────────

// Add commitment
router.post('/:id/commitments/:type', async (req, res) => {
  try {
    const key = COMMIT_KEYS[req.params.type];
    if (!key) return res.status(400).json({ error: 'Tipo de compromiso inválido' });

    const emp = await Employee.findById(req.params.id);
    if (!emp) return res.status(404).json({ error: 'Persona no encontrada' });
    if (req.user.role === 'leader' && emp.teamId !== req.user.teamId) {
      return res.status(403).json({ error: 'Sin acceso' });
    }

    emp[key].push(req.body);
    await emp.save();
    res.json(emp);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update commitment
router.put('/:id/commitments/:type/:cid', async (req, res) => {
  try {
    const key = COMMIT_KEYS[req.params.type];
    if (!key) return res.status(400).json({ error: 'Tipo de compromiso inválido' });

    const emp = await Employee.findById(req.params.id);
    if (!emp) return res.status(404).json({ error: 'Persona no encontrada' });

    const item = emp[key].id(req.params.cid);
    if (!item) return res.status(404).json({ error: 'Compromiso no encontrado' });

    Object.assign(item, req.body);
    await emp.save();
    res.json(emp);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete commitment
router.delete('/:id/commitments/:type/:cid', async (req, res) => {
  try {
    const key = COMMIT_KEYS[req.params.type];
    if (!key) return res.status(400).json({ error: 'Tipo de compromiso inválido' });

    const emp = await Employee.findById(req.params.id);
    if (!emp) return res.status(404).json({ error: 'Persona no encontrada' });

    emp[key].pull({ _id: req.params.cid });
    await emp.save();
    res.json(emp);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
