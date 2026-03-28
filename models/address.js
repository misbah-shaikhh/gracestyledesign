const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  name: String,
  phone: String,
  pincode: String,
  state: String,
  addressLine: String,
  landmark: String,
  city: String,

  isDefault: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });

module.exports = mongoose.model("Address", addressSchema);