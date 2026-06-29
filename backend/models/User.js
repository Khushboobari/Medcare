const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zip: { type: String, required: true },
  isDefault: { type: Boolean, default: false }
});

const familyMemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  relation: { type: String, required: true },
  age: { type: Number, required: true }
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  googleId: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  bloodGroup: { type: String },
  allergies: [{ type: String }],
  avatar: { type: String },
  addresses: [addressSchema],
  familyMembers: [familyMemberSchema]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
