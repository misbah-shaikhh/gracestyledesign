const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({

  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  transactionId: {
    type: String,
    unique: true
  },

  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
      },
      name: String,
      price: Number,
      quantity: Number,
      size: String,
      color: String
    }
  ],

  totalAmount: Number,

  paymentMethod: {
    type: String,
    enum: ["COD", "Online"],
    default: "COD"
  },

  paymentStatus: {
    type: String,
    enum: ["Pending", "Received", "Failed"],
    default: "Pending"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model("Payment", paymentSchema);