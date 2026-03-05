const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");


/* ---------------- SIGNUP ROUTE ---------------- */

router.post("/signup", async (req, res) => {

  try {

    const { name, email, password, phone } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email });

    if (existingEmail) {
      return res.status(400).json({
        message: "Email already registered"
      });
    }

    // Check if phone already exists
    const existingPhone = await User.findOne({ phone });

    if (existingPhone) {
      return res.status(400).json({
        message: "Phone number already registered"
      });
    }

    const newUser = new User({
      name,
      email,
      password,
      phone
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "Signup successful"
    });

  } catch (error) {

    console.error("Signup Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }

});

// check user 
router.post("/check-user", async (req, res) => {

  try {

    const { phone } = req.body;

    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({
        exists: false
      });
    }

    res.status(200).json({
      exists: true
    });

  } catch (error) {

    console.error("Check User Error:", error);

    res.status(500).json({
      message: "Server error"
    });

  }

});

/* ---------------- LOGIN ROUTE ---------------- */

router.post("/login", async (req, res) => {

  try {

    const { phone, password } = req.body;

    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid password"
      });
    }

    res.status(200).json({
      message: "Login successful"
    });

  } catch (error) {

    console.error("Login Error:", error);

    res.status(500).json({
      message: "Server error"
    });

  }

});


module.exports = router;