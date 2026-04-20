const express = require("express");
const router = express.Router();

const Order = require("../models/orders");
const Address = require("../models/address");

/* =========================
   CREATE ORDER
========================= */

const Product = require("../models/product"); // 🔥 ADD THIS

router.post("/", async (req, res) => {

    try {

        const { userId, addressId, items, paymentMethod } = req.body;

        if (!userId || !addressId || !items || items.length === 0) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const address = await Address.findById(addressId);
        if (!address) {
            return res.status(404).json({ message: "Address not found" });
        }

        let totalAmount = 0;
        const DELIVERY_FEE = 100; // ✅ ADD THIS

        const formattedItems = [];

        // 🔥 STEP 1: LOOP ITEMS + UPDATE STOCK
        for (const item of items) {

            totalAmount += item.price * item.quantity;

            // 🔥 GET PRODUCT
            const product = await Product.findById(item.productId);

            if (!product) {
                return res.status(404).json({ message: "Product not found" });
            }

            // 🔥 FIND MATCHING VARIANT
            const variant = product.variants.find(v =>
                v.size === item.size && v.color === item.color
            );

            if (!variant) {
                return res.status(400).json({ message: "Variant not found" });
            }

            // ❌ STOCK CHECK
            if (variant.stock < item.quantity) {
                return res.status(400).json({
                    message: `Not enough stock for ${product.name} (${item.size}, ${item.color})`
                });
            }

            // 🔥 SUBTRACT STOCK
            variant.stock -= item.quantity;

            // 🔥 SAVE PRODUCT
            await product.save();

            // PUSH ITEM
            formattedItems.push({
                productId: item.productId,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                size: item.size,
                color: item.color
            });
        }
        totalAmount += DELIVERY_FEE;
        // 🔥 STEP 2: CREATE ORDER
        const uniqueOrderId = "ORD" + Date.now();

        const order = new Order({
            userId,
            addressId,
            customerName: address.name,
            orderId: uniqueOrderId,
            paymentMethod,
            totalAmount,
            items: formattedItems
        });

        await order.save();

        const Payment = require("../models/payment");

        const payment = new Payment({
            orderId: order._id,
            userId: userId,
            transactionId: "TXN" + Date.now(),
            items: formattedItems, // 🔥 snapshot of items
            totalAmount,
            paymentMethod: paymentMethod || "COD",
            paymentStatus: "Pending"
        });

        await payment.save();

        res.status(201).json({
            message: "Order placed successfully",
            order
        });

    } catch (err) {
        console.error("Order error:", err);
        res.status(500).json({ message: "Server error" });
    }

});

// =========================
// GET USER ORDERS
// =========================
router.get("/", async (req, res) => {
    try {

        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ message: "User ID required" });
        }

        const orders = await Order.find({ userId })
            .populate("items.productId")
            .sort({ orderDate: -1 });

        res.status(200).json({ orders });

    } catch (err) {
        console.error("Fetch user orders error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

const Request = require("../models/requests");

router.get("/", async (req, res) => {
  try {
    const { userId } = req.query;

    const orders = await Order.find({ userId })
      .populate("items.productId");

    // 🔥 attach request info
    const ordersWithRequests = await Promise.all(
      orders.map(async (order) => {

        const itemsWithRequest = await Promise.all(
          order.items.map(async (item) => {

            const request = await Request.findOne({
              orderId: order._id,
              productId: item.productId._id
            });

            return {
              ...item.toObject(),
              request // 🔥 attach here
            };
          })
        );

        return {
          ...order.toObject(),
          items: itemsWithRequest
        };
      })
    );

    res.json({ orders: ordersWithRequests });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;