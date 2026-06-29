const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileUrl: { type: String, required: true },
  doctorName: { type: String },
  date: { type: Date, default: Date.now },
  notes: { type: String },
  status: { 
    type: String, 
    enum: ['Pending', 'Verified', 'Rejected'], 
    default: 'Pending' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Prescription', prescriptionSchema);
