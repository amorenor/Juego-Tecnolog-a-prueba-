import mongoose from 'mongoose';

// Flexible commitment schema — each type uses different subset of fields
const commitSchema = new mongoose.Schema({
  // Objetivos
  titulo:      String,
  descripcion: String,
  fechaLimite: String,
  estado:      String,
  progreso:    { type: Number, default: 0 },
  // Conversaciones 1:1
  fecha:        String,
  tipo:         String,
  resumen:      String,
  acuerdos:     String,
  proximaFecha: String,
  // Capacitaciones
  nombre:      String,
  institucion: String,
  fechaInicio: String,
  fechaFin:    String,
  horas:       Number,
  // Reconocimientos / Sanciones
  registradoPor: String,
}, { _id: true, timestamps: false });

const employeeSchema = new mongoose.Schema({
  teamId:      { type: String, required: true },
  nombre:      { type: String, required: true, trim: true },
  apellido:    { type: String, required: true, trim: true },
  rut:         String,
  nacimiento:  String,
  email:       String,
  tel:         String,
  estadoCivil: String,
  hijos:       String,
  emergNombre: String,
  emergTel:    String,
  educacion:   String,
  titulo:      String,
  cert:        String,
  idiomas:     String,
  cargo:       String,
  ingreso:     String,
  contrato:    String,
  ceco:        String,
  jornada:     String,
  objetivos:       { type: [commitSchema], default: [] },
  conversaciones:  { type: [commitSchema], default: [] },
  capacitaciones:  { type: [commitSchema], default: [] },
  reconocimientos: { type: [commitSchema], default: [] },
}, { timestamps: true });

employeeSchema.index({ teamId: 1 });

export default mongoose.model('Employee', employeeSchema);
