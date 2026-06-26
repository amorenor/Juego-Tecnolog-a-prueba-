import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import bcrypt from 'bcryptjs';

const UUID_PK = {
  type: DataTypes.UUID,
  defaultValue: DataTypes.UUIDV4,
  primaryKey: true,
  field: '_id',
};

// ── Teams ─────────────────────────────────────────────────────────────────────
export const Team = sequelize.define('Team', {
  _id:    UUID_PK,
  name:   { type: DataTypes.STRING(100), allowNull: false },
  color:  { type: DataTypes.STRING(20),  defaultValue: '#3b9eff' },
  leadId: { type: DataTypes.UUID,        allowNull: true },
  desc:   { type: DataTypes.STRING(500), allowNull: true },
}, { tableName: 'teams' });

// ── Employees ─────────────────────────────────────────────────────────────────
export const Employee = sequelize.define('Employee', {
  _id:         UUID_PK,
  nombre:      { type: DataTypes.STRING(100), allowNull: false },
  apellido:    { type: DataTypes.STRING(100), allowNull: false },
  rut:         DataTypes.STRING(20),
  nacimiento:  DataTypes.DATEONLY,
  email:       DataTypes.STRING(150),
  tel:         DataTypes.STRING(30),
  estadoCivil: DataTypes.STRING(30),
  hijos:       DataTypes.INTEGER,
  emergNombre: DataTypes.STRING(100),
  emergTel:    DataTypes.STRING(30),
  educacion:   DataTypes.STRING(50),
  titulo:      DataTypes.STRING(150),
  cert:        DataTypes.STRING(200),
  idiomas:     DataTypes.STRING(200),
  cargo:       DataTypes.STRING(100),
  ingreso:     DataTypes.DATEONLY,
  contrato:    DataTypes.STRING(30),
  ceco:        DataTypes.STRING(50),
  jornada:     DataTypes.STRING(30),
  teamId:      { type: DataTypes.UUID, allowNull: true },
}, { tableName: 'employees' });

// ── Commitment tables ─────────────────────────────────────────────────────────
export const Objetivo = sequelize.define('Objetivo', {
  _id:        UUID_PK,
  empId:      { type: DataTypes.UUID, allowNull: false },
  titulo:     DataTypes.STRING(200),
  descripcion: DataTypes.TEXT,
  fechaLimite: DataTypes.DATEONLY,
  estado:     { type: DataTypes.STRING(20), defaultValue: 'Pendiente' },
  prioridad:  { type: DataTypes.STRING(20), defaultValue: 'Media' },
}, { tableName: 'objetivos' });

export const Conversacion = sequelize.define('Conversacion', {
  _id:          UUID_PK,
  empId:        { type: DataTypes.UUID, allowNull: false },
  tipo:         { type: DataTypes.STRING(30), defaultValue: '1:1' },
  fecha:        DataTypes.DATEONLY,
  proximaFecha: DataTypes.DATEONLY,
  notas:        DataTypes.TEXT,
}, { tableName: 'conversaciones' });

export const Capacitacion = sequelize.define('Capacitacion', {
  _id:         UUID_PK,
  empId:       { type: DataTypes.UUID, allowNull: false },
  nombre:      DataTypes.STRING(200),
  proveedor:   DataTypes.STRING(200),
  fechaInicio: DataTypes.DATEONLY,
  fechaFin:    DataTypes.DATEONLY,
  estado:      { type: DataTypes.STRING(20), defaultValue: 'Pendiente' },
  descripcion: DataTypes.TEXT,
}, { tableName: 'capacitaciones' });

export const Reconocimiento = sequelize.define('Reconocimiento', {
  _id:        UUID_PK,
  empId:      { type: DataTypes.UUID, allowNull: false },
  tipo:       DataTypes.STRING(100),
  fecha:      DataTypes.DATEONLY,
  otorgadoPor: DataTypes.STRING(100),
  descripcion: DataTypes.TEXT,
}, { tableName: 'reconocimientos' });

// ── Attendance ─────────────────────────────────────────────────────────────────
export const Attendance = sequelize.define('Attendance', {
  _id:    UUID_PK,
  empId:  { type: DataTypes.UUID,        allowNull: false },
  teamId: { type: DataTypes.UUID,        allowNull: true  },
  date:   { type: DataTypes.DATEONLY,    allowNull: false },
  type:   { type: DataTypes.STRING(20),  allowNull: false },
  motivo: { type: DataTypes.STRING(500), allowNull: true  },
}, { tableName: 'attendance' });

// ── Users ─────────────────────────────────────────────────────────────────────
export const User = sequelize.define('User', {
  _id:      UUID_PK,
  name:     { type: DataTypes.STRING(100), allowNull: false },
  email:    { type: DataTypes.STRING(150), allowNull: false, unique: true },
  password: { type: DataTypes.STRING(200), allowNull: false },
  role:     { type: DataTypes.STRING(20),  defaultValue: 'leader' },
  teamId:   { type: DataTypes.UUID,        allowNull: true },
  modules:  {
    type: DataTypes.TEXT,
    defaultValue: '["home","equipos","planner"]',
    get() {
      try { return JSON.parse(this.getDataValue('modules')); }
      catch { return []; }
    },
    set(val) {
      this.setDataValue('modules', JSON.stringify(val));
    },
  },
}, {
  tableName: 'users',
  hooks: {
    beforeCreate: async (u) => {
      if (u.password) u.password = await bcrypt.hash(u.password, 10);
    },
    beforeUpdate: async (u) => {
      if (u.changed('password')) u.password = await bcrypt.hash(u.password, 10);
    },
  },
});

User.prototype.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

User.prototype.toJSON = function () {
  const v = { ...this.get() };
  delete v.password;
  return v;
};

// ── Associations ──────────────────────────────────────────────────────────────
Employee.hasMany(Objetivo,       { foreignKey: 'empId', as: 'objetivos',       onDelete: 'CASCADE' });
Employee.hasMany(Conversacion,   { foreignKey: 'empId', as: 'conversaciones',  onDelete: 'CASCADE' });
Employee.hasMany(Capacitacion,   { foreignKey: 'empId', as: 'capacitaciones',  onDelete: 'CASCADE' });
Employee.hasMany(Reconocimiento, { foreignKey: 'empId', as: 'reconocimientos', onDelete: 'CASCADE' });

Objetivo.belongsTo(Employee,       { foreignKey: 'empId' });
Conversacion.belongsTo(Employee,   { foreignKey: 'empId' });
Capacitacion.belongsTo(Employee,   { foreignKey: 'empId' });
Reconocimiento.belongsTo(Employee, { foreignKey: 'empId' });
