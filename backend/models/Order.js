const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
  qty: { type: Number, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  mrp: { type: Number, required: true },
  rxRequired: { type: Boolean, default: false }
});

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  deliveryCharge: { type: Number, default: 0 },
  gst: { type: Number, default: 0 },
  couponCode: { type: String },
  discount: { type: Number, default: 0 },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true }
  },
  paymentMethod: { 
    type: String, 
    required: true,
    enum: ['UPI', 'Card', 'Net Banking', 'Cash on Delivery']
  },
  paymentStatus: { 
    type: String, 
    enum: ['Pending', 'Paid'], 
    default: 'Pending' 
  },
  status: { 
    type: String, 
    enum: ['Placed', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'], 
    default: 'Placed' 
  },
  prescriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
