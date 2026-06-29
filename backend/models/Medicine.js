const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String, required: true },
  salt: { type: String, required: true },
  category: { 
    type: String, 
    required: true,
    enum: ['Tablets', 'Syrups', 'Vitamins', 'Skincare', 'Devices', 'Baby Care', 'Surgical', 'Ayurvedic']
  },
  description: { type: String, required: true },
  uses: { type: String, required: true },
  sideEffects: { type: String },
  dosage: { type: String },
  storage: { type: String },
  price: { type: Number, required: true },
  mrp: { type: Number, required: true },
  discount: { type: Number, default: 0 }, // Percentage discount
  rxRequired: { type: Boolean, default: false },
  stock: { type: Number, default: 0 },
  image: { type: String },
  rating: { type: Number, default: 4.5 }
}, { timestamps: true });

module.exports = mongoose.model('Medicine', medicineSchema);
