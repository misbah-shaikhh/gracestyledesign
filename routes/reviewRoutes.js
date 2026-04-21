const express = require("express");
const router = express.Router();
const Review = require("../models/review");
const Order = require("../models/orders");
const Product = require("../models/product");

/* ✅ ADD REVIEW */
router.post("/", async (req, res) => {
    try {
        const { userId, productId, orderId, rating, reviewText } = req.body;

        // 🔒 Only allow if order is delivered
        const order = await Order.findById(orderId);

        if (!order || order.status !== "Delivered") {
            return res.status(400).json({
                message: "Review allowed only after delivery"
            });
        }

        // 🔒 Prevent duplicate review
        const existing = await Review.findOne({
            userId,
            productId,
            orderId
        });

        if (existing) {
            return res.status(400).json({
                message: "You already reviewed this product"
            });
        }

        // ✅ 1. Save review
        const review = await Review.create({
            userId,
            productId,
            orderId,
            rating,
            reviewText
        });

        // ✅ 2. Recalculate rating
        const reviews = await Review.find({ productId });

        const avgRating =
            reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

        // ✅ 3. Update product
        await Product.findByIdAndUpdate(productId, {
            averageRating: Number(avgRating.toFixed(1)),
            totalReviews: reviews.length
        });

        // ✅ 4. Mark reviewed in order (prevents UI issues)
        await Order.findByIdAndUpdate(orderId, {
            $addToSet: { reviewedProducts: productId }
        });

        res.json({
            message: "Review added successfully",
            review
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

/* ✅ GET REVIEWS FOR PRODUCT */
router.get("/product/:productId", async (req, res) => {
    try {
        const reviews = await Review.find({
            productId: req.params.productId
        }).populate("userId", "name")
            .sort({ createdAt: -1 }) // newest first

        res.json(reviews);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;