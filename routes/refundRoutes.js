const express = require("express");
const router = express.Router();
const Refund = require("../models/refund");

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

    // 🔒 prevent re-processing
    if (refund.status !== "Pending") {
      return res.status(400).json({ message: "Already processed" });
    }

    refund.status = status; // Approved / Processed
    refund.processedAt = new Date();

    await refund.save();

    res.json(refund);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;