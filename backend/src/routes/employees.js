import { Router } from 'express';
import { Op } from 'sequelize';
import { Employee, Team, Objetivo, Conversacion, Capacitacion, Reconocimiento } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

const COMMIT_MODELS = {
  objetivo:      Objetivo,
  conversacion:  Conversacion,
  capacitacion:  Capacitacion,
  reconocimiento: Reconocimiento,
};

const INCLUDES = [
  { model: Objetivo,       as: 'objetivos'       },
  { model: Conversacion,   as: 'conversaciones'  },
  { model: Capacitacion,   as: 'capacitaciones'  },
  { model: Reconocimiento, as: 'reconocimientos' },
];

async function findEmpWithCommits(id) {
  return Employee.findByPk(id, { include: INCLUDES });
}

// ── GET / ─────────────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const where = {};
    if (req.query.teamId) where.teamId = req.query.teamId;
    if (req.user.role === 'leader' && !req.query.teamId) {
      where.teamId = req.user.teamId;
    }
    const employees = await Employee.findAll({
      where,
      include: INCLUDES,
      order: [['apellido', 'ASC'], ['nombre', 'ASC']],
    });
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener personas' });
  }
});

// ── POST / ────────────────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    if (req.user.role === 'leader' && req.body.teamId !== req.user.teamId) {
      return res.status(403).json({ error: 'Solo puedes agregar personas a tu equipo' });
    }
    const { objetivos, conversaciones, capacitaciones, reconocimientos, ...fields } = req.body;
    const emp = await Employee.create(fields);
    const full = await findEmpWithCommits(emp._id);
    res.status(201).json(full);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ── PUT /:id ──────────────────────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const emp = await Employee.findByPk(req.params.id);
    if (!emp) return res.status(404).json({ error: 'Persona no encontrada' });
    if (req.user.role === 'leader' && emp.teamId !== req.user.teamId) {
      return res.status(403).json({ error: 'Solo puedes editar personas de tu equipo' });
    }
    const { objetivos, conversaciones, capacitaciones, reconocimientos, _id, ...safeFields } = req.body;
    await emp.update(safeFields);
    const full = await findEmpWithCommits(req.params.id);
    res.json(full);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ── DELETE /:id ───────────────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const emp = await Employee.findByPk(req.params.id);
    if (!emp) return res.status(404).json({ error: 'Persona no encontrada' });
    if (req.user.role === 'leader' && emp.teamId !== req.user.teamId) {
      return res.status(403).json({ error: 'Solo puedes eliminar personas de tu equipo' });
    }
    await emp.destroy();
    // Clear leadId from any team that referenced this employee
    await Team.update({ leadId: null }, { where: { leadId: req.params.id } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar persona' });
  }
});

// ── POST /:id/commitments/:type ───────────────────────────────────────────────
router.post('/:id/commitments/:type', async (req, res) => {
  try {
    const Model = COMMIT_MODELS[req.params.type];
    if (!Model) return res.status(400).json({ error: 'Tipo de compromiso inválido' });

    const emp = await Employee.findByPk(req.params.id);
    if (!emp) return res.status(404).json({ error: 'Persona no encontrada' });
    if (req.user.role === 'leader' && emp.teamId !== req.user.teamId) {
      return res.status(403).json({ error: 'Sin acceso' });
    }

    await Model.create({ ...req.body, empId: req.params.id });
    const full = await findEmpWithCommits(req.params.id);
    res.json(full);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ── PUT /:id/commitments/:type/:cid ──────────────────────────────────────────
router.put('/:id/commitments/:type/:cid', async (req, res) => {
  try {
    const Model = COMMIT_MODELS[req.params.type];
    if (!Model) return res.status(400).json({ error: 'Tipo de compromiso inválido' });

    const item = await Model.findByPk(req.params.cid);
    if (!item) return res.status(404).json({ error: 'Registro no encontrado' });

    const { _id, empId, ...fields } = req.body;
    await item.update(fields);
    const full = await findEmpWithCommits(req.params.id);
    res.json(full);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ── DELETE /:id/commitments/:type/:cid ───────────────────────────────────────
router.delete('/:id/commitments/:type/:cid', async (req, res) => {
  try {
    const Model = COMMIT_MODELS[req.params.type];
    if (!Model) return res.status(400).json({ error: 'Tipo de compromiso inválido' });

    await Model.destroy({ where: { _id: req.params.cid } });
    const full = await findEmpWithCommits(req.params.id);
    res.json(full);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
