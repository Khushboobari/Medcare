const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: { type: String, trim: true, lowercase: true },
  phone: { type: String, trim: true },
  otpHash: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false }
});

// Automatically remove expired OTP records.
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('OTP', otpSchema);
