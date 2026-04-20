const express = require("express");
const router = express.Router();
const Request = require("../models/requests");
const Product = require("../models/product");
const Order = require("../models/orders");

// 🔁 Exchange
router.post("/exchange", async (req, res) => {
  try {
    const { userId, orderId, productId, newSize, newColor } = req.body;

    const request = await Request.create({
      type: "Exchange",
      userId,
      orderId,
      productId,
      newSize,
      newColor
    });

    res.json(request);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔁 Return
router.post("/return", async (req, res) => {
  try {
    const { userId, orderId, productId, reason } = req.body;

    const order = await Order.findById(orderId);

    const item = order.items.find(
      i => (i.productId._id || i.productId).toString() === productId.toString()
    );

    const DELIVERY_FEE = 100;

    const refundAmount = Math.max((item?.price || 0) - DELIVERY_FEE, 0);

    const request = await Request.create({
      type: "Return",
      userId,
      orderId,
      productId,
      reason,
      refundAmount
    });

    res.json(request);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const requests = await Request.find()
      .populate("userId")
      .populate("productId");

    res.json(requests);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    const request = await Request.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    res.json(request);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;