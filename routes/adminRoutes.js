const express = require("express");
const router = express.Router();
const User = require("../models/user");

/* ---------------- GET ALL USERS (ADMIN) ---------------- */

router.get("/users", async (req, res) => {

  try {

    const users = await User.find({ role: "customer" }, "name email phone");

    res.status(200).json({
      total: users.length,
      users: users
    });

  } catch (error) {

    console.error("Fetch Users Error:", error);

    res.status(500).json({
      message: "Server error"
    });

  }

});

// for new users (admin dashboard)
router.get("/dashboard-stats", async (req, res) => {

  try {

    const now = new Date();

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const newCustomers = await User.countDocuments({
      role: "customer",
      created_at: { $gte: startOfMonth }
    });

    res.status(200).json({
      newCustomers
    });

  } 
  catch (error) {

    console.error("Dashboard Stats Error:", error);

    res.status(500).json({
      message: "Server error"
    });

  }

});

module.exports = router;