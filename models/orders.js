const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  addressId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Address",
    required: true
  },

  customerName: {
    type: String,
    required: true
  },

  orderId: {
    type: String,
    unique: true
  },

  paymentMethod: {
    type: String,
    enum: ["COD", "ONLINE"],
    default: "COD"
  },

  status: {
    type: String,
    enum: ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"],
    default: "Pending"
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
      color: String,
      image: String
    }
  ],

  totalAmount: {
    type: Number,
    required: true
  },

  orderDate: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model("Order", orderSchema);