import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String, required: true, unique: true,
    lowercase: true, trim: true,
  },
  password: { type: String, required: true },
  name:     { type: String, required: true, trim: true },
  role:     { type: String, enum: ['manager', 'leader'], default: 'leader' },
  teamId:   { type: String, default: null },
  empId:    { type: String, default: null },
  modules:  { type: [String], default: ['home', 'equipos', 'planner'] },
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

// Never return password in API responses
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export default mongoose.model('User', userSchema);
