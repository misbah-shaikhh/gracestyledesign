const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true,
    maxlength: 100,
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    maxlength: 100
  },

  password: {
    type: String,
    required: true,
    minlength: 6
  },

  phone: {
    type: String,
    maxlength: 15,
    unique: true
  },

  role: {
    type: String,
    enum: ["customer", "admin"],
    default: "customer"
  },

  birthdate: {
    type: Date,
    default: null
  },

  created_at: {
    type: Date,
    default: Date.now
  }

});


/* PASSWORD HASHING */

userSchema.pre("save", async function () {

  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

});


module.exports = mongoose.model("User", userSchema);