const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  customer: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
    }
  },
  items: [
    {
      pizzaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pizza', required: false },
      name: { type: String, required: true },
      size: { type: String, enum: ['Small', 'Medium', 'Large', 'Regular'], required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true }
    }
  ],
  totalPrice: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Pending' },
  deliveryStatus: { type: String, enum: ['Pending', 'Preparing', 'On the way', 'Delivered', 'Cancelled'], default: 'Pending' },
  orderTime: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Order", orderSchema);
