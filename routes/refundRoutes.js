const express = require("express");
const router = express.Router();
const Refund = require("../models/refund");
const Order = require("../models/orders");
const Product = require("../models/product");

// ✅ GET ONLY PENDING REFUNDS (for dashboard)
router.get("/pending", async (req, res) => {
  try {
    const refunds = await Refund.find({ status: "Pending" })
      .populate("userId", "name email")
      .populate("orderId")
      .populate("productId", "name images");

    res.json(refunds); // 🔥 MUST be array
  } catch (err) {
    console.error("Refund fetch error:", err);
    res.status(500).json({ message: err.message });
  }
});

// ✅ UPDATE REFUND STATUS (admin action)
router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    const refund = await Refund.findById(req.params.id);
    if (!refund) {
      return res.status(404).json({ message: "Refund not found" });
    }

    if (refund.status !== "Pending") {
      return res.status(400).json({ message: "Already processed" });
    }

    refund.status = status;
    refund.processedAt = new Date();

    // 🔥 RESTORE STOCK WHEN REFUND PROCESSED
    if (status === "Processed") {

      const order = await Order.findById(refund.orderId);

      const item = order.items.find(
        i => (i.productId._id || i.productId).toString() === refund.productId.toString()
      );

      if (item) {
        const product = await Product.findById(refund.productId);

        const variant = product.variants.find(v =>
          v.size === item.size &&
          v.color === item.color
        );

        if (variant) {
          variant.stock += item.quantity || 1;
          await product.save();
        }
      }
    }

    await refund.save();

    res.json(refund);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;