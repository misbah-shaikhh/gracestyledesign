const mongoose = require("mongoose");
const requestSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["Exchange", "Return"],
    required: true
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true
  },

  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },

  // 🔥 ONLY FOR EXCHANGE
  newSize: String,
  newColor: String,

  // 🔥 ONLY FOR RETURN
  reason: String,
  refundAmount: Number,

  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});