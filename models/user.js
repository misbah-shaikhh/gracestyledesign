const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    match: /^[A-Za-z ]+$/ // character validation
  },

  contactNo: {
    type: String,
    required: true,
    unique: true,
    match: /^[0-9]{10}$/ // number validation (phone)
  },

  email: {
    type: String,
    required: true,
    unique: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ // email validation
  },

  dob: {
    type: Date,
    required: true
  },

  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
    required: true
  },

  password: {
    type: String,
    required: true // hashed password (bcrypt)
  }
});

module.exports = mongoose.model("User", userSchema);
