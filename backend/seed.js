/**
 * Seed script — crea datos iniciales si la BD está vacía.
 * Uso: npm run seed
 */
import 'dotenv/config';
import { connectDB } from './src/config/db.js';
import { Team, User } from './src/models/index.js';

const DEFAULT_TEAMS = [
  { name: 'Operaciones TI',         color: '#3b9eff' },
  { name: 'Sistemas y Procesos',    color: '#22c55e' },
  { name: 'Nuevas Tecnologías',     color: '#a855f7' },
  { name: 'Gestión y Servicios TI', color: '#ef4444' },
  { name: 'Gobierno de Datos',      color: '#f59e0b' },
];

async function seed() {
  await connectDB();

  // ── Teams ──────────────────────────────────────────────────────────────────
  const teamCount = await Team.count();
  if (teamCount === 0) {
    await Team.bulkCreate(DEFAULT_TEAMS);
    console.log(`✅ ${DEFAULT_TEAMS.length} equipos creados`);
  } else {
    console.log(`ℹ  Equipos ya existen (${teamCount}) — omitido`);
  }

  // ── Admin user ─────────────────────────────────────────────────────────────
  const adminEmail = 'gerente@aquachile.com';
  const existing = await User.findOne({ where: { email: adminEmail } });
  if (!existing) {
    await User.create({
      email: adminEmail,
      password: 'AquaChile2026',
      name: 'Gerente del Área',
      role: 'manager',
      modules: ['home', 'equipos', 'planner', 'calendar', 'permisos'],
    });
    console.log('✅ Usuario admin creado');
    console.log(`   Correo:     ${adminEmail}`);
    console.log('   Contraseña: AquaChile2026');
    console.log('   ⚠️  Cambia la contraseña desde el módulo Permisos');
  } else {
    console.log('ℹ  Admin ya existe — omitido');
  }

  console.log('\n✅ Seed completado');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Error en seed:', err.message);
  process.exit(1);
});
