const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  medicineName: { type: String, required: true },
  time: { type: String, required: true }, // Format HH:MM
  frequency: { type: String, default: 'Daily' }, // e.g. Daily, Weekly
  slot: { type: String, enum: ['Morning', 'Afternoon', 'Night'], required: true },
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Reminder', reminderSchema);
