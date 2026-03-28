const express = require("express");
const router = express.Router();
const User = require("../models/user");

// toggle wishlist
router.post("/toggle", async (req, res) => {

  const { userId, productId } = req.body;

  try {

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const exists = user.wishlist.includes(productId);

    if (exists) {

      await User.findByIdAndUpdate(
        userId,
        { $pull: { wishlist: productId } }
      );

    } else {

      await User.findByIdAndUpdate(
        userId,
        { $addToSet: { wishlist: productId } }
      );

    }

    res.json({ success: true });

  } catch (err) {

    console.error("Wishlist toggle error:", err);
    res.status(500).json({ message: "Server error" });

  }

});


// get wishlist products
router.get("/:userId", async (req, res) => {

  const userId = req.params.userId;

  if (!userId || userId === "null") {
    return res.status(400).json({ message: "Invalid userId" });
  }

  try {

    const user = await User.findById(userId).populate("wishlist");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.wishlist);

  } catch (err) {

    console.error(err);
    res.status(500).json({ message: "Server error" });

  }

});

module.exports = router;