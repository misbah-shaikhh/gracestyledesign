const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middleware/authMiddleware");

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

    // CREATE TOKEN
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    /* ROLE BASED REDIRECT */

    let redirectURL = "/index.html";

    if (user.role === "admin") {
      redirectURL = "/admin/admin.html";
    }

    res.status(200).json({
      message: "Login successful",
      token: token,
      role: user.role,
      userId: user._id,
      redirect: redirectURL
    });

  } catch (error) {

    console.error("Login Error:", error);

    res.status(500).json({
      message: "Server error"
    });

  }

});
/* ---------------- GET PROFILE ---------------- */

router.get("/profile", verifyToken, async (req, res) => {

  try {

    const user = await User.findById(req.user.id).select("name email phone birthdate");

    res.status(200).json(user);

  } catch (error) {

    res.status(500).json({
      message: "Server error"
    });

  }

});

/* ---------------- UPDATE PROFILE ---------------- */

router.put("/profile", verifyToken, async (req, res) => {

  try {

    const { birthdate } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { birthdate: birthdate },
      { new: true }
    );

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser
    });

  } catch (error) {

    console.error("Profile Update Error:", error);

    res.status(500).json({
      message: "Server error"
    });

  }

});

module.exports = router;