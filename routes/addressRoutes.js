const express = require("express");
const router = express.Router();
const Address = require("../models/address");
const verifyToken = require("../middleware/authMiddleware");

/* GET USER ADDRESSES */

router.get("/", verifyToken, async (req, res) => {

    const addresses = await Address.find({ userId: req.user.id });

  res.json(addresses);

});


/* ADD ADDRESS */

router.post("/", verifyToken, async (req, res) => {

    const existing = await Address.find({ userId: req.user.id });

    const newAddress = new Address({
      userId: req.user.id,
      ...req.body,
    isDefault: existing.length === 0
    });

    await newAddress.save();

  res.json({ message: "Address added" });

});


/* SET DEFAULT ADDRESS */

router.put("/default/:id", verifyToken, async (req, res) => {

    await Address.updateMany(
      { userId: req.user.id },
      { isDefault: false }
    );

    await Address.findByIdAndUpdate(req.params.id, {
      isDefault: true
    });

  res.json({ message: "Default address updated" });

});

// Update product
router.put("/:id", async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.status(200).json(updatedProduct);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// Get single product by ID
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json(product);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;