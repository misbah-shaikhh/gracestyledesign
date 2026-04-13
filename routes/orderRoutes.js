const express = require("express");
const router = express.Router();

const Order = require("../models/orders");
const Address = require("../models/address");

/* =========================
   CREATE ORDER
========================= */

router.post("/", async (req, res) => {

    try {

        const { userId, addressId, items, paymentMethod } = req.body;

        if (!userId || !addressId || !items || items.length === 0) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Get address
        const address = await Address.findById(addressId);
        if (!address) {
            return res.status(404).json({ message: "Address not found" });
        }

        // Calculate total
        let totalAmount = 0;

        const formattedItems = items.map(item => {
            totalAmount += item.price * item.quantity;

            return {
                productId: item.productId,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                size: item.size,
                color: item.color
            };
        });

        const uniqueOrderId = "ORD" + Date.now(); // 🔥 simple unique id

        const order = new Order({
            userId,
            addressId,
            customerName: address.name,
            orderId: uniqueOrderId, // ✅ ADD THIS
            paymentMethod,
            totalAmount,
            items: formattedItems
        });

        await order.save();

        res.status(201).json({
            message: "Order placed successfully",
            order
        });

    } catch (err) {
        console.error("Order error:", err);
        res.status(500).json({ message: "Server error" });
    }

});

module.exports = router;