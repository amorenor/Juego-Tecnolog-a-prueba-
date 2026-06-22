import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  empId:  { type: String, required: true },
  teamId: { type: String, required: true },
  date:   { type: String, required: true },
  type:   { type: String, enum: ['teletrabajo', 'vacaciones', 'compensado'], required: true },
  motivo: { type: String, default: '' },
}, { timestamps: true });

// Guarantee one record per employee per day per type
attendanceSchema.index({ empId: 1, date: 1, type: 1 }, { unique: true });
// Fast queries for team restriction checks
attendanceSchema.index({ teamId: 1, date: 1, type: 1 });

export default mongoose.model('Attendance', attendanceSchema);
