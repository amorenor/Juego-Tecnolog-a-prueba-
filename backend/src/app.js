import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import authRoutes       from './routes/auth.js';
import teamRoutes       from './routes/teams.js';
import employeeRoutes   from './routes/employees.js';
import attendanceRoutes from './routes/attendance.js';
import userRoutes       from './routes/users.js';

const app = express();

// CORS
const corsOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors({
  origin: corsOrigin,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

// Routes
app.use('/api/auth',       authRoutes);
app.use('/api/teams',      teamRoutes);
app.use('/api/employees',  employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/users',      userRoutes);

// 404 handler
app.use((req, res) => res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.path}` }));

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

export default app;
