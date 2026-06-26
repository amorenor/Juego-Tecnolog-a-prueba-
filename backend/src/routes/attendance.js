import { Router } from 'express';
import { Op } from 'sequelize';
import { Attendance } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const where = {};
    if (req.query.teamId) where.teamId = req.query.teamId;
    if (req.user.role === 'leader' && !req.query.teamId) {
      where.teamId = req.user.teamId;
    }
    if (req.query.dateFrom || req.query.dateTo) {
      where.date = {};
      if (req.query.dateFrom) where.date[Op.gte] = req.query.dateFrom;
      if (req.query.dateTo)   where.date[Op.lte] = req.query.dateTo;
    }
    const records = await Attendance.findAll({ where, order: [['date', 'ASC']] });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener registros' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { empId, teamId, date, type, motivo } = req.body;
    if (!empId || !teamId || !date || !type) {
      return res.status(400).json({ error: 'empId, teamId, date y type son requeridos' });
    }
    if (req.user.role === 'leader' && teamId !== req.user.teamId) {
      return res.status(403).json({ error: 'Solo puedes registrar tu propio equipo' });
    }

    if (type === 'teletrabajo') {
      const dow = new Date(date + 'T12:00:00').getDay();
      const limit = dow === 5 ? 1 : 2;
      const count = await Attendance.count({
        where: { teamId, date, type: 'teletrabajo', empId: { [Op.ne]: empId } },
      });
      if (count >= limit) {
        return res.status(422).json({
          error: `Límite de teletrabajo alcanzado para este día (máx. ${limit} en ${dow === 5 ? 'viernes' : 'lunes a jueves'})`,
        });
      }
    }

    // Un registro por empleado+fecha (tipos son excluyentes)
    await Attendance.destroy({ where: { empId, date } });
    const record = await Attendance.create({ empId, teamId, date, type, motivo: motivo || '' });
    res.status(201).json(record);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const record = await Attendance.findByPk(req.params.id);
    if (!record) return res.status(404).json({ error: 'Registro no encontrado' });
    if (req.user.role === 'leader' && record.teamId !== req.user.teamId) {
      return res.status(403).json({ error: 'Sin acceso' });
    }
    await record.destroy();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar registro' });
  }
});

export default router;
