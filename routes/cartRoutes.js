const express = require("express");
const router = express.Router();
const User = require("../models/user");

// ADD TO CART
router.post("/add", async (req, res) => {

    const { userId, productId, size, color } = req.body;

    try {

        const user = await User.findById(userId);

        const existing = user.cart.find(item =>
            item.productId.toString() === productId &&
            item.size === size &&
            item.color === color
        );

        if (existing) {
            existing.quantity += 1;
        } else {
            user.cart.push({
                productId,
                size,
                color,
                quantity: 1
            });
        }

        await user.save();

        res.json({ success: true });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Cart error" });
    }

});


// GET CART
router.get("/:userId", async (req, res) => {

    try {

        const user = await User.findById(req.params.userId)
            .populate("cart.productId");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user.cart || []);

    } catch (err) {
        res.status(500).json({ message: "Error loading cart" });
    }

});


// UPDATE QUANTITY
router.put("/update", async (req, res) => {

    const { userId, productId, size, color, quantity, newSize } = req.body;

    try {

        const user = await User.findById(userId);

        const item = user.cart.find(i =>
            i.productId.toString() === productId &&
            i.size === size &&
            i.color === color
        );

        if (item) {

            if (quantity !== undefined) {
                item.quantity = quantity < 1 ? 1 : quantity;
            }

            if (newSize) {
                item.size = newSize; // 🔥 update size
            }

        }

        await user.save();

        res.json({ success: true });

    } catch (err) {
        res.status(500).json({ message: "Update failed" });
    }

});


// REMOVE ITEM
router.post("/remove", async (req, res) => {

    const { userId, productId, size, color } = req.body;

    try {

        await User.findByIdAndUpdate(userId, {
            $pull: {
                cart: { productId, size, color }
            }
        });

        res.json({ success: true });

    } catch (err) {
        res.status(500).json({ message: "Remove failed" });
    }

});

// clear 
router.post("/clear", async (req, res) => {
  try {
    const { userId } = req.body;

    await User.findByIdAndUpdate(userId, {
      $set: { cart: [] }
    });

    res.json({ message: "Cart cleared" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error clearing cart" });
  }
});

module.exports = router;