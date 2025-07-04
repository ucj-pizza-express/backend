const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  // 👇 Add this for role-based access
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },

  // ✅ For password reset
  resetToken: String,
  resetTokenExpire: Date,
});

// 🔐 Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  if (!this.password) {
    return next(new Error('Password is missing'));
  }

  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('User', userSchema);
