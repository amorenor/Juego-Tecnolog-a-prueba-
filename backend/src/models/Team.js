import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
  name:   { type: String, required: true, trim: true },
  color:  { type: String, default: '#3b9eff' },
  leadId: { type: String, default: '' },
  desc:   { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('Team', teamSchema);
