const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobile: { type: String, required: true, unique: true },
  pin: { type: String, required: true },
  email: { type: String, unique: true, sparse: true },
  password: { type: String }, // keeping optional for legacy accounts
  balance: { type: Number, default: 1000 },
  otp: { type: String },
  otpExpiry: { type: Date },
  language: { type: String, default: 'en' },
  notificationsEnabled: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
