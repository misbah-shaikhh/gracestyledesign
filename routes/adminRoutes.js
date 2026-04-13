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

// for orders 
const Order = require("../models/orders");

/* ---------------- GET ALL ORDERS (ADMIN) ---------------- */

router.get("/orders", async (req, res) => {
  try {

    const orders = await Order.find()
      .populate("addressId")
      .populate("items.productId")
      .sort({ orderDate: -1 });

    res.status(200).json({
      total: orders.length,
      orders
    });

  } catch (error) {

    console.error("Fetch Orders Error:", error);

    res.status(500).json({
      message: "Server error"
    });

  }
});

router.put("/orders/:id/status", async (req, res) => {
  try {

    const { status } = req.body;

    const allowedStatuses = [
      "Pending",
      "Confirmed",
      "Shipped",
      "Delivered",
      "Cancelled"
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({
      message: "Status updated",
      order
    });

  } catch (err) {
    console.error("Status update error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;