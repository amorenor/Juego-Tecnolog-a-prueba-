import { Router } from 'express';
import Attendance from '../models/Attendance.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.teamId) filter.teamId = req.query.teamId;
    if (req.query.dateFrom || req.query.dateTo) {
      filter.date = {};
      if (req.query.dateFrom) filter.date.$gte = req.query.dateFrom;
      if (req.query.dateTo)   filter.date.$lte = req.query.dateTo;
    }
    // Leaders can only see their team
    if (req.user.role === 'leader' && !req.query.teamId) {
      filter.teamId = req.user.teamId;
    }
    const records = await Attendance.find(filter).sort({ date: 1 });
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

    // Leaders can only register their own team
    if (req.user.role === 'leader' && teamId !== req.user.teamId) {
      return res.status(403).json({ error: 'Solo puedes registrar tu propio equipo' });
    }

    // Teletrabajo restriction: max 2 per team Mon-Thu, max 1 on Fri
    if (type === 'teletrabajo') {
      const dow = new Date(date + 'T12:00:00').getDay();
      const limit = dow === 5 ? 1 : 2;
      const count = await Attendance.countDocuments({
        teamId, date, type: 'teletrabajo',
        empId: { $ne: empId },
      });
      if (count >= limit) {
        return res.status(422).json({
          error: `Límite de teletrabajo alcanzado para este día (máx. ${limit} en ${dow === 5 ? 'viernes' : 'lunes a jueves'})`,
        });
      }
    }

    // Remove any existing record for same employee+date (types are mutually exclusive)
    await Attendance.deleteMany({ empId, date });

    const record = await Attendance.create({ empId, teamId, date, type, motivo: motivo || '' });
    res.status(201).json(record);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Ya existe un registro para ese día' });
    }
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const record = await Attendance.findById(req.params.id);
    if (!record) return res.status(404).json({ error: 'Registro no encontrado' });
    if (req.user.role === 'leader' && record.teamId !== req.user.teamId) {
      return res.status(403).json({ error: 'Sin acceso' });
    }
    await Attendance.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar registro' });
  }
});

export default router;
