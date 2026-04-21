const express = require("express");
const router = express.Router();
const Request = require("../models/requests");
const Product = require("../models/product");
const Order = require("../models/orders");

// 🔁 Exchange
router.post("/exchange", async (req, res) => {
  try {
    const { userId, orderId, productId, newSize, newColor } = req.body;

    // 🔥 PREVENT DUPLICATE REQUEST
    const existing = await Request.findOne({
      orderId,
      productId,
      type: "Exchange",
      status: { $in: ["Pending", "Approved"] }
    });

    if (existing) {
      return res.status(400).json({
        message: "Exchange request already exists for this item"
      });
    }

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

    // 🔥 PREVENT DUPLICATE REQUEST
    const existing = await Request.findOne({
      orderId,
      productId,
      type: "Return",
      status: { $in: ["Pending", "Approved"] }
    });

    if (existing) {
      return res.status(400).json({
        message: "Return request already exists for this item"
      });
    }

    const order = await Order.findById(orderId);

    const item = order.items.find(
      i => (i.productId._id || i.productId).toString() === productId.toString()
    );

    const refundAmount = item?.price || 0;

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

    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    // 🔒 prevent double processing
    if (request.status !== "Pending") {
      return res.status(400).json({ message: "Already processed" });
    }

    request.status = status;

    // 🔥 APPLY LOGIC ONLY ON APPROVE
    if (status === "Approved") {

      if (request.type === "Exchange") {
        await handleExchange(request);
      }

      if (request.type === "Return") {
        await handleReturn(request);
      }
    }

    await request.save();

    res.json(request);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

async function handleExchange(request) {

  const product = await Product.findById(request.productId);

  const variant = product.variants.find(v =>
    v.size === request.newSize &&
    v.color === request.newColor
  );

  if (!variant || variant.stock <= 0) {
    throw new Error("Selected variant out of stock");
  }

  // 🔥 1. DEDUCT STOCK
  variant.stock -= 1;
  await product.save();

  // 🔥 2. GET ORIGINAL ORDER
  const originalOrder = await Order.findById(request.orderId);

  // 🔥 3. CREATE EXCHANGE ORDER
  const newOrder = await Order.create({
    userId: request.userId,
    addressId: originalOrder.addressId,
    customerName: originalOrder.customerName,
    orderId: "EXC" + Date.now(),

    orderType: "exchange",
    parentOrderId: request.orderId,

    status: "Confirmed",

    items: [{
      productId: request.productId,
      name: product.name,
      price: 0, // 🔥 important (no payment)
      quantity: 1,
      size: request.newSize,
      color: request.newColor
    }],

    totalAmount: 0 // 🔥 no money involved
  });

  request.newOrderId = newOrder._id;
}

const Refund = require("../models/refund");

async function handleReturn(request) {

  // 🔥 CREATE REFUND ENTRY
  await Refund.create({
    userId: request.userId,
    orderId: request.orderId,
    requestId: request._id,
    productId: request.productId, 
    amount: request.refundAmount,
    method: "COD", // or detect from order later
    status: "Pending"
  });

  // 🔥 OPTIONAL: mark inside request
  request.refundStatus = "Pending";
}

module.exports = router;